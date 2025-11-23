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

  const getDataLimits = (data: Point[]) => {
    if (data.length === 0) {
      return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    }

    const xValues = data.map((p) => p.x);
    const yValues = data.map((p) => p.y);

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
    };
  };

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

    const limits = getDataLimits(points.value);

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
            min: limits.minX,
            max: limits.maxX,
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
            min: limits.minY,
            max: limits.maxY,
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
        const limits = getDataLimits(newPoints);
        chartInstance.data.datasets[0].data = newPoints;

        // обновляем границы осей
        if (chartInstance.options.scales) {
          const xScale = chartInstance.options.scales.x;
          const yScale = chartInstance.options.scales.y;
          xScale!.min = limits.minX;
          xScale!.max = limits.maxX;
          yScale!.min = limits.minY;
          yScale!.max = limits.maxY;
        }

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
