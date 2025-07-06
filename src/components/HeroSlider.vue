<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";

const slides = [
  {
    id: 1,
    title: "Latest MacBook Pro",
    subtitle: "Supercharged by M2 Pro",
    description:
      "Performa revolusioner dan daya tahan baterai sepanjang hari dalam desain yang menakjubkan.",
    image: "https://img.odcdn.com.br/wp-content/uploads/2022/10/mac.jpg",
    cta: "Selengkapnya",
  },
  {
    id: 2,
    title: "iPhone 15 Pro",
    subtitle: "Titanium. So strong. So light.",
    description:
      "Desain titanium yang ringan, sistem kamera pro paling canggih, dan chip A18 Pro yang mengubah segalanya.",
    image:
      "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_800/https://www.olx.co.id/news/wp-content/uploads/2024/10/iphone-15-pro-max-white.jpg",
    cta: "Lihat Detail",
  },
  {
    id: 3,
    title: "Premium Accessories",
    subtitle: "Enhance your experience",
    description:
      "Rasakan setiap detail musik dengan headphone dan earbud peredam bising terbaik kami.",
    image:
      "https://images.pexels.com/photos/8534088/pexels-photo-8534088.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cta: "Jelajahi Sekarang",
  },
];

const currentSlide = ref(0);
let slideInterval = null;
const sliderContainerRef = ref(null); // Tambahkan baris ini

// --- State baru untuk fungsi geser ---
const isDragging = ref(false);
const startPos = ref(0);
const currentTranslate = ref(0);
const prevTranslate = ref(0);
const animationID = ref(0);

// Menggunakan computed property untuk mengatur posisi slider
const sliderStyle = computed(() => ({
  transform: `translateX(${currentTranslate.value}px)`,
  transition: isDragging.value ? "none" : "transform 0.5s ease-out",
}));

// --- Fungsi untuk memulai, menggeser, dan mengakhiri ---
const getPositionX = (event) =>
  event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;

function dragStart(index) {
  return function (event) {
    currentSlide.value = index;
    startPos.value = getPositionX(event);
    isDragging.value = true;
    animationID.value = requestAnimationFrame(animation);
    stopAutoSlide(); // Hentikan autoplay saat digeser
  };
}

function dragging(event) {
  if (isDragging.value) {
    const currentPosition = getPositionX(event);
    currentTranslate.value =
      prevTranslate.value + currentPosition - startPos.value;
  }
}

function dragEnd() {
  cancelAnimationFrame(animationID.value);
  isDragging.value = false;
  const movedBy = currentTranslate.value - prevTranslate.value;

  // Jika geseran lebih dari 50px, pindah slide
  if (movedBy < -50 && currentSlide.value < slides.length - 1) {
    currentSlide.value += 1;
  }
  if (movedBy > 50 && currentSlide.value > 0) {
    currentSlide.value -= 1;
  }

  setPositionByIndex();
  startAutoSlide(); // Mulai lagi autoplay setelah selesai
}

function animation() {
  if (isDragging.value) requestAnimationFrame(animation);
}

// Menyesuaikan posisi slider berdasarkan slide yang aktif
function setPositionByIndex() {
  const slideWidth = sliderContainerRef.value?.clientWidth || 0;
  currentTranslate.value = currentSlide.value * -slideWidth;
  prevTranslate.value = currentTranslate.value;
}

const goToSlide = (index) => {
  currentSlide.value = index;
  setPositionByIndex();
};

// --- Autoplay Logic ---
const startAutoSlide = () => {
  if (!slideInterval) {
    slideInterval = setInterval(() => {
      const nextIndex = (currentSlide.value + 1) % slides.length;
      goToSlide(nextIndex);
    }, 5000);
  }
};

const stopAutoSlide = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
};

onMounted(() => {
  window.addEventListener("resize", setPositionByIndex);
  setPositionByIndex();
  startAutoSlide();
});

onUnmounted(() => {
  window.removeEventListener("resize", setPositionByIndex);
  stopAutoSlide();
});

// --- Emit & CTA Handler ---
const emit = defineEmits(["shop-now"]);
const handleShopNow = () => {
  emit("shop-now");
};
</script>

<template>
  <div ref="sliderContainerRef" class="relative h-[70vh] md:h-[85vh] overflow-hidden w-full">
    <div :style="sliderStyle" class="flex h-full w-full" @mousedown.prevent="dragStart(currentSlide)($event)"
      @touchstart.prevent="dragStart(currentSlide)($event)" @mousemove.prevent="dragging" @touchmove.prevent="dragging"
      @mouseup="dragEnd" @mouseleave="dragEnd" @touchend="dragEnd">
      <div v-for="(slide, index) in slides" :key="slide.id"
        class="relative h-full w-full flex-shrink-0 cursor-grab active:cursor-grabbing">
        <div :style="{ backgroundImage: 'url(' + slide.image + ')' }" class="w-full h-full bg-cover bg-center">
          <div class="absolute inset-0 bg-black/50 pointer-events-none"></div>
        </div>

        <div class="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
          <div class="relative z-20 text-white space-y-4 sm:space-y-6 px-4">
            <h2 class="text-xl md:text-2xl font-light opacity-90">
              {{ slide.subtitle }}
            </h2>
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
              {{ slide.title }}
            </h1>
            <p class="text-base md:text-lg opacity-80 max-w-2xl mx-auto">
              {{ slide.description }}
            </p>
            <button @click="handleShopNow"
              class="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-700 transform hover:scale-105 transition duration-300 shadow-lg pointer-events-auto">
              {{ slide.cta }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
      <button v-for="(_, index) in slides" :key="index" @click="goToSlide(index)" :class="[
        'w-3 h-3 rounded-full transition-all duration-300',
        index === currentSlide
          ? 'bg-white scale-125'
          : 'bg-white/50 hover:bg-white/70',
      ]" aria-label="Go to slide"></button>
    </div>
  </div>
</template>
