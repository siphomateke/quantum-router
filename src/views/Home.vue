<template>
  <div class="padding-container">
    <div class="card">
      <header class="card-header">
        <span class="card-header-title">{{ $i18n('home.cards.dataUsageGraph') }}</span>
      </header>
      <div class="card-content">
        <template v-if="!offline">
          <template v-if="usage">
            {{ $i18n('home.dataUsageAmount', {
              received: round(usage.received, 2),
              sent: round(usage.sent, 2)
            }) }}
          </template>
          <line-chart
            :chart-data="lineChartData"
            :options="chartOptions"
            :height="400"
          />
          {{ lineChartData.labels }}
          {{ lineChartData.datasets }}
          <div
            v-for="(item, index) in lineChartData.datasets[0].data"
            :key="index">
            {{ item }}
          </div>
        </template>
        <template v-else>
          <b-message
            type="is-info"
            has-icon>{{ $i18n('home.adminOnly') }}</b-message>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { modes } from '@/store';
import LineChart from '@/components/charts/LineChart';
// import router from '@/common/huawei-router-api';

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
      historySize: 60,
    };
  },
  computed: {
    offline() {
      return !(this.$mode > modes.OFFLINE);
    },
    statisticsHistory() {
      const { history } = this.$store.state.monitoring;
      return history.slice(history.length - this.historySize, -1);
    },
  },
  watch: {
    statisticsHistory() {
      let previousUsage = null;
      for (let i = 0; i < this.statisticsHistory.length; i++) {
        const data = this.statisticsHistory[i];

        const usage = {};
        usage.received = data.CurrentDownload / (1024 * 1024);
        usage.sent = data.CurrentUpload / (1024 * 1024);

        if (previousUsage) {
          const diff = usage.received - previousUsage.received;
          this.$set(this.lineChartData.labels, i, data.date);
          this.$set(this.lineChartData.datasets[0].data, i, diff);
        }

        previousUsage = usage;
      }
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
      const factor = 10 ** precision;
      return Math.round(num * factor) / factor;
    },
    async graph() {
      if (!this.offline) {
        await this.$store.dispatch('monitoring/getTrafficStatistics');
        /* const data = await router.monitoring.getTrafficStatistics();
        this.lineChartData = Object.assign({}, this.lineChartData);

        if (!this.usage) {
          this.usage = {};
        }

        this.usage.received = data.CurrentDownload / (1024 * 1024);
        this.usage.sent = data.CurrentUpload / (1024 * 1024);

        if (this.previousUsage) {
          if (this.lineChartData.datasets[0].data.length > 60) {
            this.lineChartData.labels.splice(0, 1);
            this.lineChartData.datasets[0].data.splice(0, 1);
          }
          const diff = this.usage.received - this.previousUsage.received;
          this.lineChartData.labels.push(Date.now());
          this.lineChartData.datasets[0].data.push(diff);
        }

        this.previousUsage = Object.assign({}, this.usage); */
      }
    },
  },
};
</script>
