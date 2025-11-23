import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { IStocks, StocksCompanies } from '../interfaces';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import store, {
  selectChoosedCompanies,
  selectStocksByName,
  useDispatch,
  useSelector,
} from '../store/store';
import {
  chooseCompanies,
  getStocksByName,
  postChoosedCompanies,
} from '../store/stocksSlice';
import { Header } from '../components/Header';
import styles from './StocksPage.module.css';
import { parseDollar } from '../helper';

Chart.register(...registerables);
Chart.register(zoomPlugin);

const pad = 10;

const columns: GridColDef[] = [
  { field: 'Date', headerName: 'Date', flex: 1 },
  { field: 'Open', headerName: 'Open', flex: 1 },
];

export const StocksPage = () => {
  const dispatch = useDispatch();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [company, setCompany] = useState<StocksCompanies>(StocksCompanies.AAPL);
  const data = useSelector(useCallback(selectStocksByName(company), [company]));
  const [selectedCompanies, setSelectedCompanies] = useState<StocksCompanies[]>(
    [],
  );

  const handleChooseCompany = async (event: SelectChangeEvent) => {
    const resultAction = await dispatch(
      getStocksByName(event.target.value as string),
    );
    if (
      resultAction.meta.requestStatus === 'fulfilled' ||
      resultAction.payload === 'Data already loaded'
    ) {
      setCompany(event.target.value as StocksCompanies);
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const company = event.target.name as StocksCompanies;
    if (event.target.checked) {
      setSelectedCompanies((prev) => [...prev, company]);
    } else {
      setSelectedCompanies((prev) => prev.filter((c) => c !== company));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(chooseCompanies(selectedCompanies));
    dispatch(postChoosedCompanies());
  };

  const processedData = useMemo(
    () =>
      data.map((d: IStocks) => ({
        x: Date.parse(d.Date),
        y: parseDollar(d.Open),
      })),
    [data],
  );

  const { minY, maxY, dateLimits } = useMemo(() => {
    if (!data.length)
      return { minY: 0, maxY: 0, dateLimits: { min: 0, max: 0 } };
    let minY = Infinity,
      maxY = -Infinity,
      minX = Infinity,
      maxX = -Infinity;

    for (const d of data) {
      const y = parseDollar(d.Open);
      const x = Date.parse(d.Date);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    const day = 86_400_000;
    return {
      minY,
      maxY,
      dateLimits: { min: minX - 10 * day, max: maxX + 10 * day },
    };
  }, [data]);

  const createChart = (ctx: CanvasRenderingContext2D) => {
    return new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Close/Last Price',
            data: processedData,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: true,
            pointRadius: 0,
            pointHitRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        normalized: true,
        scales: {
          x: {
            type: 'time',
            min: dateLimits.min,
            max: dateLimits.max,
            time: {
              parser: 'MM/dd/yyyy',
              tooltipFormat: 'PP',
              unit: 'day',
              displayFormats: {
                day: 'MMM dd yyyy',
              },
            },
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            beginAtZero: false,
            min: minY - pad,
            max: maxY + pad,
            title: { display: true, text: 'Price' },
          },
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy',
            },
            limits: {
              x: { min: dateLimits.min, max: dateLimits.max },
              y: { min: minY - pad, max: maxY + pad },
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d')!;
    chartInstanceRef.current = createChart(ctx);

    return () => chartInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    chart.data.datasets[0].data = processedData; // useMemo (см. ниже)
    chart.options.scales!.x!.min = dateLimits.min;
    chart.options.scales!.x!.max = dateLimits.max;
    chart.options.scales!.y!.min = minY - pad;
    chart.options.scales!.y!.max = maxY + pad;

    chart.options.plugins!.zoom!.limits = {
      x: { min: dateLimits.min, max: dateLimits.max },
      y: { min: minY - pad, max: maxY + pad },
    };
    chart.update(); // 'none' отключает анимацию
  }, [processedData, dateLimits]);

  useEffect(() => {
    setSelectedCompanies([...selectChoosedCompanies(store.getState())]);
    dispatch(getStocksByName(company));
  }, []);

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.companies}>
          <h2 className={styles.companies__header}>
            Выберите компании для участия в торгах:
          </h2>
          <form onSubmit={handleSubmit} className={styles.companies__checkboxes}>
            {Object.values(StocksCompanies).map((item, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    name={item}
                    onChange={handleCheckboxChange}
                    checked={selectedCompanies.includes(item)}
                  />
                }
                label={item}
                key={index}
              />
            ))}
            <Button type='submit'>Сохранить</Button>
          </form>
        </div>
        <div className={styles.choosed}>
          <h2 className={styles.companies__header}>
            Компания для отображения изменения курса:
          </h2>
          <Select
            value={company}
            size='medium'
            sx={{ width: 100 }}
            onChange={handleChooseCompany}
          >
            {Object.values(StocksCompanies).map((item, index) => (
              <MenuItem value={item}>{item}</MenuItem>
            ))}
          </Select>
        </div>
        <div className={styles.chart}>
          <canvas id='stocks' ref={chartRef}></canvas>
        </div>
        <div style={{ width: '100%' }}>
          {' '}
          {/* Контейнер с высотой для скролла */}
          <DataGrid
            rows={data.map((item: IStocks, index: number) => ({
              ...item,
              id: index,
            }))}
            columns={columns}
            rowHeight={40}
            autoHeight={true}
          />
        </div>
      </div>
    </>
  );
};
