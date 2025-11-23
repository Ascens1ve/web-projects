<template>
  <div class="loading">
    <img
      class="loading__img"
      width="400"
      height="400"
      src="@/assets/loading-1-svgrepo-com.svg"
      alt="Loading..."
    />
  </div>
</template>

<style>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading {
  width: 100%;
  height: 100%;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading__img {
  animation: rotate 4s linear infinite;
}
</style>
