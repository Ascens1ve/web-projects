<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { StockSymbols } from '@/interfaces';
import { useStocksStore } from '@/services/stocksStore';
import { actionsHandler, parseDollar } from '@/services/helper';
import { storeToRefs } from 'pinia';
import { useSocketTrades } from '@/composables/useSocketTrades';
import { useChart } from '@/composables/useChart';
import ButtonComponent from '@/components/ButtonComponent.vue';
import { fetchBuyingPrices } from '@/services/api';
import { useAlert } from '@/composables/useAlert';

interface DerivedShare {
  amount: number;
  total: string; // amount * currentPrice
  profitPerUnit: string; // currentPrice - buyingPricePerUnit | loading
  profitPercent: string; // ((currentPrice - buyingPricePerUnit) / buyingPricePerUnit) * 100 | loadng
}

const stocksStore = useStocksStore();
const {
  currentDate: date,
  amountAndPrice,
  balance: moneyBalance,
  sumOfShares: shareBalance,
} = storeToRefs(stocksStore);

const fullBalance = computed(() => moneyBalance.value + shareBalance.value);

const buyingPrice = ref<Partial<Record<StockSymbols, number>>>({});
const handleUpdatePrices = async () => {
  const result = await fetchBuyingPrices();
  if (result) {
    Object.entries(result).forEach(([company, price]) => {
      buyingPrice.value[company as StockSymbols] = price;
    });
  }
};

const chartRef = ref<HTMLCanvasElement | null>(null);
const modalRef = ref<HTMLDialogElement | null>(null);

const { updateAlert } = useAlert();

const { speed, choosedCompanies, stocks, isStart, connect, trade } = useSocketTrades();
const currentSymbol = ref<StockSymbols | null>(null);

watch(choosedCompanies, () => {
  currentSymbol.value = choosedCompanies.value[0];
  handleUpdatePrices();
});

const points = computed(() =>
  currentSymbol.value
    ? (stocks[currentSymbol.value]?.map((s) => ({
        x: Date.parse(s.Date),
        y: parseDollar(s.Open),
      })) ?? [])
    : [],
);

const derivedShares = computed<Record<StockSymbols, DerivedShare | undefined>>(() => {
  const result = {} as Record<StockSymbols, DerivedShare | undefined>;
  for (const company of choosedCompanies.value) {
    const ap = amountAndPrice.value.get(company);
    if (!ap || !buyingPrice.value[company]) {
      result[company] = undefined;
      break;
    }
    const currentPrice = ap[1];
    const amount = ap[0];
    const total = amount * currentPrice;
    const buyPricePerUnit = buyingPrice.value[company];
    const profitPerUnit = total - buyPricePerUnit;
    const profitPercent = buyPricePerUnit > 0 ? (profitPerUnit / buyPricePerUnit) * 100 : 0;

    result[company] = {
      amount,
      total: total.toFixed(2),
      profitPerUnit: profitPerUnit.toFixed(2),
      profitPercent: profitPercent.toFixed(2),
    };
  }
  return result;
});

const getDerived = (item: StockSymbols): DerivedShare => {
  return (
    derivedShares.value[item] ?? {
      amount: 0,
      total: '0.00',
      profitPerUnit: '✗',
      profitPercent: '✗',
    }
  );
};

async function shareAction(
  name: StockSymbols,
  amount: number = 1,
  price: number,
  type: 'buy' | 'sell',
) {
  const res = await trade(name, amount, price, type);
  updateAlert(res.success ? 'success' : 'failed', 'active', res.message);
  if (res.action) {
    actionsHandler(name, res.action, stocksStore);
    handleUpdatePrices();
  }
}

let chartController: ReturnType<typeof useChart> | null = null;

const openModal = () => {
  modalRef.value?.show();
  nextTick(() => {
    if (!chartController && chartRef.value) {
      chartController = useChart(chartRef, points);
    }
  });
};

const closeModal = () => {
  modalRef.value?.close();
};

watch(
  () => stocksStore.error,
  (newValue) => {
    if (newValue !== '') {
      updateAlert('failed', 'active', newValue);
    }
  },
);

onMounted(() => {
  if (chartRef.value) {
    chartController = useChart(chartRef, points);
  }
});

onUnmounted(() => {
  chartController?.destroy();
});
</script>

<template>
  <div>
    <ButtonComponent class="widthmax" v-if="!isStart" @click="connect" variant="outlined"
      >Участвовать в торгах</ButtonComponent
    >
    <div v-else class="main">
      <h2 class="main__text">Текущая имитируемая дата: {{ date }}</h2>
      <h2 class="main__text">Скорость имитации: {{ speed }} с</h2>
      <h2 class="main__text">Общий баланс: {{ fullBalance.toFixed(2) }}</h2>
      <h2 class="main__text">
        Средства: {{ moneyBalance.toFixed(2) }}, в акциях: {{ shareBalance.toFixed(2) }}
      </h2>
      <h2 class="main__text">Компании, участвующие в торгах</h2>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th class="table-cell">Компании</th>
              <th class="table-cell">Стоимость</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in choosedCompanies" v-bind:key="item">
              <td class="table-cell">{{ item }}</td>
              <td class="table-cell">
                {{ amountAndPrice.get(item) ? amountAndPrice.get(item)![1] : '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 class="main__text">
        Информация об купленных акциях:
        <ButtonComponent @click="handleUpdatePrices">⟳</ButtonComponent>
      </h2>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th class="table-cell">Компании</th>
              <th class="table-cell">Количество</th>
              <th class="table-cell">Общая стоимость</th>
              <th class="table-cell">Прибыль/убыток</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in choosedCompanies" v-bind:key="item">
              <td class="table-cell">{{ item }}</td>
              <td class="table-cell">{{ getDerived(item).amount }}</td>
              <td class="table-cell">{{ getDerived(item).total }}</td>
              <td class="table-cell">{{ getDerived(item).profitPerUnit }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ButtonComponent @click="openModal" variant="outlined">Меню</ButtonComponent>
    </div>
    <dialog class="modal" ref="modalRef">
      <ButtonComponent @click="closeModal" class="close-button">
        <img src="@/assets/address-card.svg" width="15" height="15" alt="X" class="close-icon" />
      </ButtonComponent>
      <select v-model="currentSymbol">
        <option v-for="company in choosedCompanies" v-bind:key="company" v-bind:value="company">
          {{ company }}
        </option>
      </select>
      <canvas ref="chartRef"></canvas>
      <h2>
        Цена:
        {{
          currentSymbol
            ? amountAndPrice.get(currentSymbol)
              ? amountAndPrice.get(currentSymbol)![1]
              : '???'
            : '?'
        }}$
      </h2>
      <div class="modal-buttons">
        <ButtonComponent
          @click="shareAction(currentSymbol!, 1, amountAndPrice.get(currentSymbol!)![1], 'buy')"
          variant="outlined"
          >Купить</ButtonComponent
        >
        <ButtonComponent
          @click="shareAction(currentSymbol!, 1, amountAndPrice.get(currentSymbol!)![1], 'sell')"
          variant="outlined"
          >Продать</ButtonComponent
        >
      </div>
    </dialog>
  </div>
</template>

<style>
.main {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 30px;
}

.table {
  border: 1px solid black;
  border-collapse: collapse;
  min-width: 320px;
  table-layout: auto;
  width: max-content;
}

.table-wrapper {
  gap: 5px;
  align-items: center;
  overflow-x: auto;
}

.table-cell {
  margin: 0;
  padding: 8px;
  border: 1px solid black;
}

.modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: none;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  height: 600px;
  width: 600px;
  overflow: hidden;
  z-index: 2;
}

.modal:not([open]) {
  display: none;
}

.modal-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.widthmax {
  width: 100%;
}

canvas {
  max-width: 100%;
  max-height: 400px;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
}

@media only screen and (max-width: 768px) {
  .main {
    width: 100%;
  }
  .main__text {
    align-self: flex-start;
    text-align: left;
  }
}

@media only screen and (max-width: 480px) {
  .main {
    width: 100%;
  }
  .main__text {
    align-self: flex-start;
    text-align: left;
  }
}
</style>
