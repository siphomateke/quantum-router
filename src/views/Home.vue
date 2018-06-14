<template>
<div class="padding-container">
  <div class="card">
    <header class="card-header">
      <span class="card-header-title">{{ $i18n('home_cards_data_usage_graph') }}</span>
    </header>
    <div class="card-content">
      <template v-if="!offline">
        <template v-if="usage">
          {{ $i18n('home_data_usage', round(usage.received, 2), round(usage.sent, 2)) }}
        </template>
        <line-chart
        :chart-data="lineChartData"
        :options="chartOptions"
        :height="400"
        >
        </line-chart>
      </template>
      <template v-else>
        <b-message type="is-info" has-icon>{{ $i18n('home_admin_only') }}</b-message>
      </template>
    </div>
  </div>
</div>
</template>

<script>
import {modes} from '@/store';
import LineChart from '@/components/charts/LineChart.js';
import router from 'huawei-router-api/browser';
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
  computed: {
    offline() {
      return !(this.$mode > modes.OFFLINE);
    },
  },
  mounted() {
    this.globalBus.$on('refresh:graph', this.graph);
  },
  beforeDestroy() {
    this.globalBus.$off('refresh:graph', this.graph);
  },
  methods: {
    round(num, precision) {
      const factor = Math.pow(10, precision);
      return Math.round(num * factor) / factor;
    },
    async graph() {
      if (!this.offline) {
        const data = await router.monitoring.getTrafficStatistics();
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
          }
          const diff = this.usage.received - this.previousUsage.received;
          this.lineChartData.labels.push(Date.now());
          this.lineChartData.datasets[0].data.push(diff);
        }

        this.previousUsage = Object.assign({}, this.usage);
      }
    },
  },
};
</script>
