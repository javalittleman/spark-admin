<template>
  <div>
    <order-table order-type="0" />
  </div>
</template>
<script>
import OrderTable from './components/OrderTable'

export default {
  name: 'WxShopOrderNormal',
  components: { OrderTable }
}
</script>
