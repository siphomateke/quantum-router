import { Line, mixins } from 'vue-chartjs';

export default {
  extends: Line,
  name: 'line-chart',
  mixins: [mixins.reactiveProp],
  props: ['options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
