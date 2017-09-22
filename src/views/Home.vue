<template>
<div class="page-content">
  <div class="box">
    <section class="section">
      <div class="content">
        <template v-if="usage">
          Received/Sent: {{ usage.received | round(2) }} / {{ usage.sent | round(2) }}
        </template>
        <line-chart
        :chart-data="lineChartData"
        :options="chartOptions"
        :height="400"
        >
        </line-chart>
      </div>
    </section>
  </div>
</div>
</template>

<script>
import LineChart from '@/components/charts/LineChart.js';
import {RouterController} from '@/chrome/router.js';
export default {
  name: 'Home',
  components: {
    LineChart,
  },
  data() {
    return {
      // The data for our dataset
      lineChartData: {
        labels: [],
        datasets: [{
          label: 'Download',
          backgroundColor: '#FFEB3B',
          borderColor: '#FFEB3B',
          data: [],
          yAxisID: 'download',
          xAxisID: 'time',
        }],
      },

      // Configuration options go here
      chartOptions: {
        scales: {
          yAxes: [{
            id: 'download',
            type: 'linear',
            scaleLabel: {
              display: true,
              labelString: 'Download (mb)',
            },
            ticks: {
              suggestedMax: 2,
            },
          }],
          xAxes: [{
            id: 'time',
            type: 'time',
            scaleLabel: {
              display: true,
              labelString: 'Time',
            },
          }],
        },
        animation: {
          duration: 0, // general animation time
        },
        hover: {
          animationDuration: 0, // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
        maintainAspectRatio: false,
        responsive: true,
      },
      usage: null,
      previousUsage: null,
    };
  },
  mounted() {
    this.bus.$on('refresh', () => {
      RouterController.getTrafficStatistics().then((data) => {
        this.lineChartData = Object.assign({}, this.lineChartData);

        if (!this.usage) {
          this.usage = {};
        }

        this.usage.received = data.CurrentDownload / (1024 * 1024);
        this.usage.sent = data.CurrentUpload/ (1024 * 1024);

        if (this.previousUsage) {
          if (this.lineChartData.datasets[0].data.length > 60) {
            this.lineChartData.labels.splice(0, 1);
            this.lineChartData.datasets[0].data.splice(0, 1);
            console.log(this.lineChartData.datasets[0].data);
          }
          let diff = this.usage.received - this.previousUsage.received;
          this.lineChartData.labels.push(Date.now());
          this.lineChartData.datasets[0].data.push(diff);
        }

        this.previousUsage = Object.assign({}, this.usage);
      });
    });
  },
  filters: {
    round(num, precision) {
      let factor = Math.pow(10, precision);
      return Math.round(num * factor) / factor;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~styles/vars.scss';
</style>
