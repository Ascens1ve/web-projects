<template>
  <div class="not-found">
    <h1 class="text">404 - Страница не найдена!</h1>
    <RouterLink to="/" class="text">На главную</RouterLink>
  </div>
</template>

<style>
.not-found {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.text {
  font-size: 36px;
}
.text:hover {
  background: none;
}
</style>
