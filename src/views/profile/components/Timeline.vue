<template>
  <div class="block">
    <el-timeline>
      <el-timeline-item v-for="(item,index) of LogTimeline" :key="index" :timestamp="item.loginTime | parseTime" placement="top">
        <el-card>
          <p><i class="el-icon-monitor" />  {{ item.osType }}</p>
          <p><i class="el-icon-mouse" />  {{ item.browser }}</p>
          <p><i class="el-icon-price-tag" /> {{ item.ip }}</p>
          <p><i class="el-icon-map-location" /> {{ item.location }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { findLatelyLog } from '@/api/sys/log.js'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          account: ''
        }
      }
    }
  },
  data() {
    return {
      LogTimeline: null
    }
  },
  created() {
    findLatelyLog(this.user.account).then(response => {
      this.LogTimeline = response.data
    })
  }
}
</script>
