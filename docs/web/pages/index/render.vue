<template>
  <BaseLayout>
    Home
  </BaseLayout>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import BaseLayout from '@/layout/baseLayout'

export default {
  components: {
    BaseLayout
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      indexData: state => state.indexStore?.data
    })
  }
}
</script>

<style>

</style>