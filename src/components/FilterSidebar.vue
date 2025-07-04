<script setup>
const props = defineProps(["productsStore"]);
const emit = defineEmits(["clear"]);

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
];
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-3">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Filters</h3>
      <button
        @click="$emit('clear')"
        class="text-sm text-primary hover:text-primary/80 transition duration-150"
      >
        Clear All
      </button>
    </div>

    <!-- Category Filter -->
<div class="mb-6">
  <h4 class="font-medium text-gray-900 mb-3">Category</h4>
  <div class="space-y-2">
    <!-- All Categories -->
    <label class="flex items-center">
      <input
        type="radio"
        :checked="!props.productsStore.selectedCategory"
        @change="props.productsStore.setSelectedCategory(null)"
        class="form-radio h-4 w-4 text-primary"
      />
      <span class="ml-2 text-gray-700">All Categories</span>
    </label>

    <!-- Real Categories -->
    <label
      v-for="category in props.productsStore.categories.filter(c => c.name !== 'All Categories')"
      :key="category.id"
      class="flex items-center"
    >
      <input
        type="radio"
        :checked="props.productsStore.selectedCategory === category.name"
        @change="props.productsStore.setSelectedCategory(category.name)"
        class="form-radio h-4 w-4 text-primary"
      />
      <span class="ml-2 text-gray-700">{{ category.name }}</span>
    </label>
  </div>
</div>


    <!-- Brand Filter -->
    <div class="mb-6">
      <h4 class="font-medium text-gray-900 mb-3">Brand</h4>
      <div class="space-y-2">
        <label class="flex items-center">
          <input
            type="radio"
            :checked="props.productsStore.selectedBrand === ''"
            @change="props.productsStore.setSelectedBrand('')"
            class="form-radio h-4 w-4 text-primary"
          />
          <span class="ml-2 text-gray-700">All Brands</span>
        </label>
        <label
          v-for="brand in props.productsStore.brands"
          :key="brand"
          class="flex items-center"
        >
          <input
            type="radio"
            :checked="props.productsStore.selectedBrand === brand"
            @change="props.productsStore.setSelectedBrand(brand)"
            class="form-radio h-4 w-4 text-primary"
          />
          <span class="ml-2 text-gray-700">{{ brand }}</span>
        </label>
      </div>
    </div>

    <!-- Sort By -->
    <div class="mb-6">
      <h4 class="font-medium text-gray-900 mb-3">Urutkan</h4>
      <div class="flex flex-col space-y-2">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          @click="props.productsStore.setSortOption(option.value)"
          :class="[
            'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors duration-200',
            props.productsStore.sortOption === option.value
              ? 'bg-primary text-white font-semibold'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>
