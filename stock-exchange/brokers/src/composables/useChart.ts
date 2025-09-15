import { watch, type Ref } from 'vue';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

interface Point {
  x: number;
  y: number;
}

Chart.register(...registerables);
Chart.register(zoomPlugin);

export function useChart(chartRef: Ref<HTMLCanvasElement | null>, points: Ref<Point[]>) {
  let chartInstance: Chart | null = null;

  // Функция инициализации графика
  const initChart = () => {
    if (!chartRef.value) return;

    // Уничтожаем предыдущий график если существует
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const ctx = chartRef.value.getContext('2d');
    if (!ctx) return;

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Open',
            borderColor: '#9BD0F5',
            backgroundColor: 'rgba(155, 208, 245, 0.1)',
            borderWidth: 1,
            fill: true,
            pointRadius: 0,
            data: points.value,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'dd MMM yyyy',
            },
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Price ($)',
            },
          },
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy',
            },
          },
        },
      },
    });
  };

  watch(
    chartRef,
    (newVal) => {
      if (newVal) initChart();
    },
    { immediate: true },
  );

  watch(
    points,
    (newPoints) => {
      if (chartInstance) {
        chartInstance.data.datasets[0].data = newPoints;
        chartInstance.update();
      }
    },
    { deep: true },
  );

  return {
    destroy: () => {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    },
  };
}
