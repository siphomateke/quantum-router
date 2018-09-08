import {Line, mixins} from 'vue-chartjs/dist/vue-chartjs';

export default Line.extend({
  name: 'line-chart',
  mixins: [mixins.reactiveProp],
  props: ['options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
});
