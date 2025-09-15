import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import webpack from 'webpack';

const __dirname = path.resolve();

export default {
    entry: {
        main: './public/js/main.js',  // Главный файл для сборки
    },
    output: {
        path: path.resolve(__dirname, 'dist'),  // Папка для собранных файлов
        filename: 'assets/[name].[contenthash].bundle.js',  // Имя файла с хешем для кэширования
        publicPath: '/',
        clean: true,
    },
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    devtool: 'source-map',  // Для генерации sourcemaps
    devServer: {
        static: path.resolve(__dirname, 'dist'),  // Папка для контента
        port: 3000,  // Порт для сервера
        hot: true,  // Включение горячей перезагрузки
    },    
    module: {
        rules: [
            {
                test: /\.js$/,  // Обработка всех JavaScript файлов
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',  // Транспиляция через Babel
                    options: { presets: ['@babel/preset-env'] }, // Настройки для ES6
                },
            },
            { test: /\.css$/,  use: ['style-loader', 'css-loader'] },
            { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
            { test: /\.pug$/,  use: ['pug-loader'] },
            {
                test: /\.(png|jpg|gif|svg|webp)$/,  // Обработка изображений
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/[name].[hash].[ext]',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),  // Очищаем папку dist перед сборкой
        new HtmlWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',  // Разделение на отдельные чанки
        },
    },
};