<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
// #ifdef APP-PLUS
import appUpdate from "@/utils/appUpdate";
// #endif
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
  // #ifdef APP-PLUS
  appUpdate();
  // #endif
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
</style>
