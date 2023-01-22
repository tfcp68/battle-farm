const common = require('./webpack.config');
const { merge } = require('webpack-merge');

module.exports = merge(common,{
    mode: "development",
    devtool: 'source-map',
    devServer: {
        compress:true,
        hot:true,
    }

})