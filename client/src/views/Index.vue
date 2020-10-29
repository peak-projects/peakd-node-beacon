<template>
  <div>
    <div class="container relative mx-auto mt-12">
      <div class="items-center flex flex-wrap">
        <div class="w-full ml-auto mr-auto text-center">
          <div class="justify-center text-center flex flex-wrap">
            <vue-typed-js
              :strings="['Hive Blockchain Node Monitor', 'Hive Blockchain Node Scanner', 'Hive Blockchain Node Beacon']"
              :typeSpeed="100"
              :backSpeed="50"
              :backDelay="250">
              <h1 class="text-white font-semibold text-5xl typing"></h1>
            </vue-typed-js>
          </div>
        </div>
      </div>
    </div>
    <header-component class="mt-12"></header-component>
    <div class="mt-12 pl-8 pr-8">
      <node-table></node-table>
    </div>
    <footer-component />
  </div>
</template>
<script>
import HeaderComponent from "@/components/common/Header.vue";
import NodeTable from "@/components/common/NodeTable.vue";
import FooterComponent from "@/components/common/Footer.vue";

export default {
  components: {
    HeaderComponent,
    NodeTable,
    FooterComponent,
  },
};
</script>
