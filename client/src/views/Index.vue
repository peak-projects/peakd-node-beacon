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
    <div class="container relative mx-auto mt-12">
      <div class="items-center flex flex-wrap">
        <div class="w-full ml-auto mr-auto text-center">
          <div class="justify-center text-center">
            <h2 class="text-white font-semibold text-3xl typing">
              Test your nodes speed on peakd.com
            </h2>
            <button class="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-base my-3 px-8 py-3 rounded shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
              <a href="https://peakd.com/me/tools/benchmark">Try it now</a>
            </button>
          </div>
        </div>
      </div>
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
