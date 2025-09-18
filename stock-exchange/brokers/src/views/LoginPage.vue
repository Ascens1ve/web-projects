<script setup lang="ts">
import { useAlert } from '@/composables/useAlert';
import router from '@/router';
import { useUserStore } from '@/services/userStore';
import { ref, watch } from 'vue';

interface ILoginData {
  alias: string;
  password: string;
}

const formValues = ref<ILoginData>({
  alias: '',
  password: '',
});

const store = useUserStore();
const { updateAlert } = useAlert();

const handleLoginSubmit = async () => {
  try {
    await store.login(formValues.value.alias, formValues.value.password);
    router.push('/');
  } catch {}
};

watch(
  () => store.error,
  (val) => {
    if (val) {
      updateAlert('failed', 'active', val);
      store.clearError();
    }
  },
);
</script>

<template>
  <div class="form-wrapper">
    <form class="form" @submit.prevent="handleLoginSubmit">
      <div class="form-element">
        <label for="alias" class="form-element__label">Псевдоним</label>
        <input
          id="alias"
          type="text"
          class="form-element__input"
          v-model="formValues.alias"
          autocomplete="username"
          required
          minlength="4"
          maxlength="48"
        />
      </div>
      <div class="form-element">
        <label for="password" class="form-element__label">Пароль</label>
        <input
          id="password"
          type="password"
          class="form-element__input"
          autocomplete="current-password"
          v-model="formValues.password"
          required
          minlength="8"
          maxlength="32"
        />
      </div>
      <button type="submit" class="form__button">Войти</button>
    </form>
  </div>
</template>

<style lang="scss">
$brdr-radius: 8px;

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-wrapper {
  flex: 1;
  width: 100%;
  height: 100%;
  @include flex-center;
}

.form {
  padding: 20px;
  @include flex-center;
  flex-direction: column;
  gap: 15px;
  box-sizing: border-box;
  border: 2px solid #34ebc3;
  border-radius: $brdr-radius;
  transition:
    border 0.5s linear,
    box-shadow 0.5s linear;
}

.form:hover,
.form:focus-within {
  border: 25px solid #34ebc3;
  box-shadow: 12px 12px 2px 1px rgb(0 0 255 / 0.2);
}

.form-element {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-element__label {
  transform: translateX(0);
  transition: transform 0.2s ease;
}

.form-element:focus-within .form-element__label {
  transform: translateX(10%);
}

.form-element__input {
  border-radius: $brdr-radius;
  border: 2px solid gray;
  padding: 5px;
}

.form__button {
  font-family: inherit;
  font-size: 1em;
  width: 100%;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: $brdr-radius;
  box-sizing: border-box;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(#e66465, #9198e5) border-box;
  background-clip: padding-box, border-box;
  background-origin: padding-box, border-box;
  cursor: pointer;
}

.form__button:hover {
  background:
    linear-gradient(#ededed, #ededed) padding-box,
    linear-gradient(#e66465, #9198e5) border-box;
}
</style>
