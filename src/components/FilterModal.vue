<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex flex-col">
      <div class="bg-white w-full h-1/2 max-h-[50vh] rounded-t-2xl shadow-lg overflow-hidden flex flex-col mt-auto">
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-xl font-bold text-gray-900">Filters</h2>
          <button @click="onClose" class="text-gray-600 hover:text-black text-2xl">✕</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <FilterSidebar
            :productsStore="productsStore"
            @clear="handleClearFilters"
          />
        </div>
      </div>
      <div class="flex-1 bg-black/50" @click="onClose"></div>
    </div>
  </transition>
</template>

<script setup>
import FilterSidebar from './FilterSidebar.vue';
const props = defineProps({
  show: Boolean,
  onClose: Function,
  productsStore: Object,
  handleClearFilters: Function
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>


