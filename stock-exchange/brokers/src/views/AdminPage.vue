<script setup lang="ts">
import ButtonComponent from '@/components/ButtonComponent.vue';
import NotifyModal from '@/components/NotifyModal.vue';
import { useAlert } from '@/composables/useAlert';
import type { StockSymbols } from '@/interfaces';
import { fetchBrokersInfo } from '@/services/api';
import { onMounted, ref } from 'vue';

type TInfo = Record<
  string,
  {
    shares: Partial<Record<StockSymbols, [number, number, number]>>;
    balance: number;
  }
>;

const info = ref<TInfo>({});
const isLoading = ref<boolean>(false);

const updateInfo = async () => {
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    const newInfo = await fetchBrokersInfo();
    if (newInfo) info.value = newInfo;
  } catch (error) {
    updateAlert('failed', 'active', (error as Error).message);
  } finally {
    isLoading.value = false;
  }
};

const { alertConfig, updateAlert } = useAlert();

onMounted(() => {
  updateInfo();
});
</script>

<template>
  <NotifyModal
    v-bind:type="alertConfig.type"
    v-bind:state="alertConfig.state"
    @close="alertConfig.state = 'hidden'"
    >{{ alertConfig.text }}</NotifyModal
  >
  <ButtonComponent @click="updateInfo">Обновить</ButtonComponent>
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th class="table-cell">Псевдоним</th>
          <th class="table-cell">Компании</th>
          <th class="table-cell">Количество</th>
          <th class="table-cell">Общая стоимость</th>
          <th class="table-cell">Прибыль/убыток</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in Object.keys(info)">
          <template
            v-for="[company, data] in Object.entries(info[item].shares)"
            v-bind:key="`${item}-${company}`"
          >
            <tr>
              <td class="table-cell">{{ item }}</td>
              <td class="table-cell">{{ company }}</td>
              <td class="table-cell">{{ data[0] }}</td>
              <td class="table-cell">{{ data[1].toFixed(2) }}</td>
              <td class="table-cell">{{ data[2].toFixed(2) }}</td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style>
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

td {
  word-break: break-word;
}

th,
td {
  white-space: nowrap;
}
</style>
