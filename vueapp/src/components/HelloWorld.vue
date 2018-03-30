<template>
  <div id="hello">
    <!--<Slideout menu="#menu" panel="#panel" :toggleSelectors="['.toggle-button']" @on-open="open">-->
      <Slideout menu="#menu" panel="#panel" :toggleSelectors="['.toggle-button']">
      <nav id="menu">
        <section class="menu-section">
          <h3 class="menu-section-title">Menu</h3>
          <ul class="menu-section-list">
            <li><a href="" target="_blank" v-on:click="fetch_data">Today</a></li>
            <li><a href="https://github.com/mango/slideout#usage" target="_blank">Radius</a></li>
            <li><a href="https://github.com/mango/slideout#api" target="_blank">Date Range</a></li>
            <li><a href="https://github.com/mango/slideout#browser-support" target="_blank">Documentation</a></li>
            <li><a href="https://github.com/mango/slideout#faq" target="_blank">FAQ</a></li>
          </ul>
        </section>
      </nav>

      <main id="panel">
        <header>
          <div>
            <b-button variant="outline" class="toggle-button">☰</b-button>
            {{result}}
          </div>
        </header>

      </main>
    </Slideout>
  </div>
</template>

<script>
  import Slideout from 'vue-slideout'
  import API from '../../../MetaWeatherAPI/index'
  import axios from 'axios'
  export default {
    name: 'app',
    components: {
      Slideout
    },
    data: function () {
      return {
        result: 0
      }
    },
    methods: {
      // open: function () {
      //   console.log('slideoutOpen')
      // }

      fetch_data : function(){
        API.woeid_by_query('Los Angeles').then(result=>{
          console.log(result)
        })


      }
    }
  }
</script>

<style>

</style>
