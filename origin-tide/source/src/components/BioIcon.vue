<script setup lang="ts">
import { useId } from 'vue'
withDefaults(defineProps<{ id: string; size?: number }>(), { size: 48 })
const uid = `bio-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const paint = (name: string) => `url(#${uid}-${name})`
const ref = (name: string) => `#${uid}-${name}`
const colony = [ [35, 22, .46], [63, 25, .45], [23, 48, .43], [50, 48, .51], [77, 49, .43], [36, 74, .45], [65, 75, .44] ]
const worm = [ [18, 69, -25], [15, 55, -3], [19, 40, 25], [31, 30, 63], [46, 31, 107], [56, 43, 144], [61, 57, 150], [73, 65, 99], [85, 57, 27], [88, 43, -4] ]
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="bio-icon">
    <defs>
      <linearGradient :id="`${uid}-pink`" x1=".15" y1="0" x2=".8" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#e8a7dc"/><stop offset=".32" stop-color="#ba69bd"/><stop offset=".7" stop-color="#923d9d"/><stop offset="1" stop-color="#632a7c"/></linearGradient>
      <linearGradient :id="`${uid}-coral`" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="#ffe7ad"/><stop offset=".3" stop-color="#ff9476"/><stop offset=".7" stop-color="#f55f7d"/><stop offset="1" stop-color="#af3067"/></linearGradient>
      <linearGradient :id="`${uid}-cytoplasm`" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffbbba"/><stop offset=".5" stop-color="#ed849f"/><stop offset="1" stop-color="#a24d9a"/></linearGradient>
      <linearGradient :id="`${uid}-blue`" x1=".15" y1="0" x2=".8" y2="1"><stop stop-color="#a5edff"/><stop offset=".3" stop-color="#5aa8ff"/><stop offset=".68" stop-color="#5c61db"/><stop offset="1" stop-color="#303386"/></linearGradient>
      <linearGradient :id="`${uid}-violet`" x1=".15" y1="0" x2=".8" y2="1"><stop stop-color="#f2d9ff"/><stop offset=".3" stop-color="#b98aff"/><stop offset=".72" stop-color="#7852c8"/><stop offset="1" stop-color="#3d367b"/></linearGradient>
      <linearGradient :id="`${uid}-gold`" x1=".05" y1="0" x2=".8" y2="1"><stop stop-color="#fff8b5"/><stop offset=".27" stop-color="#ffe878"/><stop offset=".65" stop-color="#f1ac35"/><stop offset="1" stop-color="#bd6626"/></linearGradient>
      <linearGradient :id="`${uid}-orange`" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#ffe6a3"/><stop offset=".3" stop-color="#ffb14e"/><stop offset=".7" stop-color="#f17b31"/><stop offset="1" stop-color="#ad3d3d"/></linearGradient>
      <linearGradient :id="`${uid}-teal`" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#c6fff0"/><stop offset=".27" stop-color="#61e8d6"/><stop offset=".6" stop-color="#20b3b7"/><stop offset="1" stop-color="#176185"/></linearGradient>
      <linearGradient :id="`${uid}-green`" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ecff9d"/><stop offset=".3" stop-color="#a9e67c"/><stop offset=".7" stop-color="#4ac69a"/><stop offset="1" stop-color="#1b827f"/></linearGradient>
      <linearGradient :id="`${uid}-sea`" x1=".1" y1="0" x2=".7" y2="1"><stop stop-color="#8ef1f0"/><stop offset=".45" stop-color="#318fc0"/><stop offset="1" stop-color="#284582"/></linearGradient>
      <radialGradient :id="`${uid}-glass`" cx=".3" cy=".2" r=".9"><stop stop-color="#e9caff" stop-opacity=".95"/><stop offset=".45" stop-color="#9271ef" stop-opacity=".85"/><stop offset="1" stop-color="#4067c7" stop-opacity=".65"/></radialGradient>
      <filter :id="`${uid}-shadow`" x="-35%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#07152e" flood-opacity=".36"/></filter>
      <g :id="`${uid}-cell`">
        <path d="M-8-40 15-35 33-19 39 5 27 28 6 39-20 31-36 10-35-13-22-32Z" :fill="paint('pink')"/>
        <path d="m-8-40 3 8-19 10-11 9 13-19Z" fill="#ffe8cc"/>
        <path d="m15-35 18 16 6 24-10-4-5-19Z" fill="#ffb6bc"/>
        <path d="m-27-15 20-15 25 8 12 20-10 24-18 8-22-8-12-20Z" :fill="paint('cytoplasm')"/>
        <path d="m-27-15 20-15 3 18-15 14-13 0Z" fill="#ffc6b5" opacity=".5"/>
        <path d="m-20 22 22 8 18-8 7 6-21 11-26-8Z" fill="#92346f" opacity=".55"/>
        <path d="m-7-18 18 1 11 15-6 18-18 7-16-12-2-16Z" :fill="paint('blue')"/>
        <path d="m-7-18 18 1-5 10-13 2-13 0Z" fill="#a5c5ff"/>
        <path d="m6-7 13 6-3 17-13-7Z" fill="#5454bd"/>
        <path d="m-7-5 13-2 6 10-9 6-11-5Z" fill="#9984ef"/>
        <path d="m-7-5 8 0 3 5-7 3-5-3Z" fill="#d1b3ff"/>
        <path d="m-23-8 5 3 2 9-5 4-5-5-1-7Z" :fill="paint('gold')"/>
        <path d="m18 12 7 1 3 7-7 5-6-4Z" :fill="paint('gold')"/>
        <path d="m-13 22 7-3 7 4-4 5-8-1Z" :fill="paint('gold')"/>
        <path d="m15-25 6 4-2 5-5-2Z" fill="#ffe68c"/>
        <circle cx="-13" cy="13" r="2.2" fill="#ffd4ac"/><circle cx="8" cy="24" r="1.6" fill="#ffdeb0"/>
      </g>
      <g :id="`${uid}-tinycell`">
        <path d="M0-16 12-11 17 1 10 13-3 17-14 7-14-7Z" :fill="paint('pink')"/>
        <path d="m0-16 12 5-7 8-12-2Z" fill="#ffcab7"/>
        <path d="m-3-6 8 1 4 7-5 7-8-2-3-7Z" :fill="paint('blue')"/>
        <path d="m8-5 4 1 1 4-4 1Z" fill="#ffe39b"/>
      </g>
    </defs>
    <g :filter="paint('shadow')" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="id === 'membrane'">
        <path d="M31 9 59 6 80 22 91 47 83 73 61 91 33 89 12 68 7 41 17 21Z" :fill="paint('green')"/>
        <path d="m31 9 28-3 21 16 11 25-9-3-9-19-18-11-22 3-13 13-5 21-8-10 10-20Z" fill="#d9e88a"/>
        <path d="m31 19 25-4 20 14 7 22-9 23-19 11-22-4-17-18-1-23Z" fill="#9caf57"/>
        <path d="m31 19 25-4 20 14-22 10-25-6-14 7Z" fill="#becb70"/>
        <path d="m25 50 12-9 9 16 9 7 12-25 8 6-18 28-14-7-9-16-8 7Z" fill="#f2c873"/>
        <path d="m32 25 6-3 8 7-2 6-6-2Zm33-1 6 4-2 11-7 3-3-5ZM18 62l7-2 6 5-3 7-7-2ZM60 76l6-6 10 1-1 8-9 3Z" fill="#eab567"/>
      </template>
      <template v-else-if="id === 'rna'">
        <path d="M28 9C78 21 20 36 71 50 19 64 77 79 27 92" stroke="#292e85" stroke-width="9"/>
        <path d="M72 9C22 21 80 36 29 50 81 64 23 79 73 92" stroke="#216a9a" stroke-width="9"/>
        <g v-for="(y, i) in [16, 28, 40, 52, 64, 76, 88]" :key="y" :transform="`translate(0 ${y})`">
          <path :d="i % 3 === 1 ? 'M39-3H62L64 3H37Z' : 'M30-3H71L73 3H28Z'" :fill="paint('blue')"/>
          <path :d="i % 3 === 1 ? 'M50-3H62L64 3H50Z' : 'M50-3H71L73 3H50Z'" :fill="paint('teal')"/>
          <path :d="i % 3 === 1 ? 'M39-3H62' : 'M30-3H71'" stroke="#e4f6ff" stroke-width="1" opacity=".8"/>
        </g>
        <path d="M28 8C76 21 22 35 70 49M70 49C21 63 76 78 28 91" :stroke="paint('blue')" stroke-width="7"/>
        <path d="M72 8C24 21 78 35 30 49M30 49C79 63 24 78 72 91" :stroke="paint('teal')" stroke-width="7"/>
        <path d="M27 7c20 6 23 12 17 18M31 50c24 7 25 13 19 20" stroke="#adeeff" stroke-width="1.4" opacity=".8"/>
      </template>
      <template v-else-if="id === 'metabolism'">
        <g transform="rotate(-27 50 50)">
          <g fill="#73cbd2"><path d="m27 27-4-10 4-2 4 12Zm18-3-1-13h4l1 13Zm17 0 3-12 4 1-4 13Zm17 7 8-9 3 3-9 10ZM26 70l-5 11 4 2 5-11Zm18 5-1 13h4l1-12Zm18-1 4 12 4-2-5-12Z"/></g>
          <path d="M12 38 26 25 72 23 87 34 94 51 84 68 69 76 28 75 11 62 6 50Z" :fill="paint('green')"/>
          <path d="m12 38 14-13 46-2 15 11-16-3-42 1Z" fill="#d8e38d"/>
          <path d="m17 41 15-9 38-1 15 11 3 11-12 12-39 4-19-11Z" :fill="paint('violet')"/>
          <path d="m30 46 8-8 12 5-7 11 13 7 14-12-4-10-11 2-1 11-11 5-9-7Z" stroke="#e13d80" stroke-width="6"/>
          <path d="m31 44 7-6 12 5-7 11 13 7 14-12" stroke="#ff8bb0" stroke-width="2"/>
          <path d="m20 46 5-4 5 4-3 7-5 1Zm49 13 4-6 7 1 2 5-6 5ZM45 32h7l1 4-7 2Z" :fill="paint('gold')"/>
        </g>
      </template>
      <template v-else-if="id === 'division'">
        <path d="M29 24 49 31 70 25 78 68 51 75 27 68Z" :fill="paint('pink')"/>
        <use :href="ref('cell')" transform="translate(29 48) scale(.63 .82) rotate(-12)"/>
        <use :href="ref('cell')" transform="translate(72 51) scale(.63 .82) rotate(15)"/>
        <path d="m48 26 3 9-2 12 3 12-3 14" stroke="#ffe0c8" stroke-width="2" opacity=".9"/>
        <path d="m9 17 7-4 4 6-7 4ZM82 81l7-3 3 6-8 3Z" :fill="paint('gold')"/>
      </template>
      <template v-else-if="id === 'flagellum'">
        <path d="M52 50 65 55 75 65 78 76 84 81 94 79 98 83 88 87 79 85 71 78 69 68 60 61 48 59Z" :fill="paint('blue')"/>
        <path d="m53 51 13 6 10 12 1 9 8 6 10-2" stroke="#b9eaff" stroke-width="2"/>
        <use :href="ref('cell')" transform="translate(34 35) scale(.72 .77) rotate(-25)"/>
        <path d="m8 21 6 1-2 9-7-2ZM22 5l4 6-8 4-3-5Z" fill="#ffc5bb"/>
      </template>
      <template v-else-if="id === 'photosynthesis'">
        <g transform="rotate(-28 44 55)">
          <path d="M8 40 22 26 59 25 78 37 83 55 75 75 57 84 24 82 8 67 3 54Z" :fill="paint('green')"/>
          <path d="m8 40 14-14 37-1 19 12-24-5-29 3Z" fill="#edffb0"/>
          <path d="m9 57 15 19 35 1 17-15-3 13-16 9-33-2-16-15Z" fill="#238d89"/>
          <g v-for="x in [22, 40, 58]" :key="x" :transform="`translate(${x} 42)`">
            <path d="M-7 0 0-5 8-1 9 22 1 27-7 23Z" fill="#267f86"/>
            <path d="M-7 0 0-5 8-1 1 4Z" fill="#efffa8"/>
            <path d="m-7 6 8 4 8-5v5l-8 5-8-4Zm0 10 8 4 8-5v5l-8 5-8-4Z" fill="#a9e876"/>
          </g>
        </g>
        <path d="m76 4 5 5 7 1 2 7-2 7-7 4-8-2-5-7 2-8Z" :fill="paint('gold')"/>
        <path d="m79 0-1 4m17 11-4 1M64 7l4 3m22 19-3-4M65 30l4-5" stroke="#ffe191" stroke-width="2.5"/>
      </template>
      <template v-else-if="id === 'nucleus'">
        <path d="M45 7 70 12 86 30 92 54 78 79 53 92 28 84 10 64 8 37 23 17Z" :fill="paint('pink')"/>
        <path d="m45 7 25 5 16 18-25-10-31 6-20 21-2-10 15-20Z" fill="#ffc7cb"/>
        <path d="m36 21 25-1 20 17 2 25-17 20-27 2-21-20-1-25Z" :fill="paint('violet')"/>
        <path d="m36 21 25-1 20 17-27 1-37 1Z" fill="#b7bdff"/>
        <path d="m17 39 37-1-15 46-21-20Z" fill="#7863ce"/>
        <path d="m54 38 27-1 2 25-17 20-27 2Z" fill="#50489b"/>
        <path d="m39 38 17-5 14 11-1 18-17 10-17-11-4-13Z" :fill="paint('blue')"/>
        <path d="m39 38 17-5 14 11-20 5-19-1Z" fill="#b9d5ff"/>
        <path d="m44 47 12-2 7 9-7 10-12-3-4-8Z" fill="#aa82ec"/>
        <g fill="#d7ccff"><path d="m28 31 4-3 4 3-4 5Zm44 20 5-1 1 5-4 3ZM27 65l4-3 4 5-4 3ZM51 76l5-1 2 4-5 3Z"/></g>
      </template>
      <template v-else-if="id === 'mitochondria'">
        <path d="M12 38 25 21 45 10 67 10 85 22 92 42 85 62 67 81 45 90 27 84 19 68 9 54Z" :fill="paint('orange')"/>
        <path d="m12 38 13-17 20-11h22l18 12-22-6-19 3-20 12Z" fill="#ffe7a7"/>
        <path d="m24 39 20-17 20-2 15 11 5 13-9 18-18 16-16 4-12-9-3-15-9-8Z" fill="#b84948"/>
        <path d="m24 39 20-17 20-2 15 11 5 13-9 18-18 16-16 4-12-9-3-15-9-8Z" :fill="paint('coral')" opacity=".7"/>
        <path d="m30 34 10 7-8 10 8 10-2 13 9 2 3-14-9-10 9-11-9-13Zm24-12 10 9-12 13 11 11-8 17 10-8 6-12-10-9 11-12-8-9Z" :fill="paint('gold')"/>
        <path d="m30 34 10 7-8 10 8 10-2 13M54 22l10 9-12 13 11 11-8 17" stroke="#fff4a8" stroke-width="1.5"/>
        <path d="m19 68 8 16 18 6 22-9 18-19-21 12-18 8-12-4Z" fill="#a9513e" opacity=".6"/>
      </template>
      <template v-else-if="id === 'colony'">
        <path d="m30 7 38 4 26 31-5 32-25 23-35-5L6 68 4 36Z" fill="#fda3c2" opacity=".22"/>
        <use v-for="(cell, i) in colony" :key="i" :href="ref('cell')" :transform="`translate(${cell[0]} ${cell[1]}) scale(${cell[2]})`"/>
      </template>
      <template v-else-if="id === 'multicellular'">
        <path d="M34 8 53 4 70 13 79 32 74 55 66 75 54 94 38 88 23 71 18 48 23 24Z" :fill="paint('teal')"/>
        <path d="m34 8 19-4 17 9-19 8-28 3Z" fill="#ccfff0"/>
        <path d="m23 24 28-3-9 24-24 3Z" fill="#89f0d6"/>
        <path d="m51 21 19-8 9 19-5 23-32-10Z" fill="#42bdcb"/>
        <path d="m18 48 24-3 15 25-19 18-15-17Z" fill="#2589b1"/>
        <path d="m42 45 32 10-8 20-12 19-16-6 19-18Z" fill="#536bb7"/>
        <use :href="ref('tinycell')" transform="translate(45 24) scale(.72)"/>
        <use :href="ref('tinycell')" transform="translate(62 43) scale(.75)"/>
        <use :href="ref('tinycell')" transform="translate(35 49) scale(.78)"/>
        <use :href="ref('tinycell')" transform="translate(51 70) scale(.74)"/>
        <path d="m28 14-6-6m54 22 8-2m-12 33 8 4M24 71l-8 4M49 92l-1 6" stroke="#aceee9" stroke-width="2"/>
      </template>
      <template v-else-if="id === 'sponge'">
        <path d="M10 82 23 74 74 74 91 85 77 93 29 93Z" fill="#4e638a"/>
        <path d="M17 43 29 37 40 43 44 84 30 91 15 83Z" :fill="paint('coral')"/>
        <path d="m17 43 11 5 2 43-15-8Z" fill="#ff9d96"/>
        <path d="M38 19 54 12 69 18 72 80 56 90 39 82Z" :fill="paint('pink')"/>
        <path d="m38 19 15 7 3 64-17-8Z" fill="#ff9aa2"/>
        <path d="m53 26 16-8 3 62-16 10Z" fill="#ce4e91"/>
        <path d="M69 51 80 45 90 51 91 82 79 90 68 82Z" :fill="paint('coral')"/>
        <ellipse cx="54" cy="19" rx="16" ry="8" fill="#ffc7b3"/><ellipse cx="54" cy="19" rx="10" ry="4.8" fill="#822b69"/><path d="M45 20q9-6 18 0" stroke="#c9578d" stroke-width="2"/>
        <ellipse cx="28" cy="43" rx="12" ry="6" fill="#ffd3b8"/><ellipse cx="28" cy="43" rx="7" ry="3.6" fill="#94406a"/>
        <ellipse cx="80" cy="51" rx="11" ry="6" fill="#ffc4ad"/><ellipse cx="80" cy="51" rx="6.5" ry="3.4" fill="#9b3d64"/>
        <g fill="#a53b77"><ellipse cx="46" cy="40" rx="2.4" ry="4"/><ellipse cx="58" cy="54" rx="3" ry="4.5"/><ellipse cx="47" cy="70" rx="2.5" ry="4"/><ellipse cx="23" cy="62" rx="2.4" ry="3.8"/><ellipse cx="33" cy="76" rx="2" ry="3"/><ellipse cx="78" cy="71" rx="2.5" ry="4"/></g>
      </template>
      <template v-else-if="id === 'cnidaria'">
        <path d="M29 49C19 65 38 66 27 88M43 52C55 66 28 76 43 96M57 51C45 70 71 74 56 93M71 49C81 64 62 71 76 86" :stroke="paint('violet')" stroke-width="5"/>
        <path d="M34 51C39 66 27 72 35 83M64 51C60 64 74 69 67 79" stroke="#78c8ed" stroke-width="2" opacity=".9"/>
        <path d="M11 46 17 28 30 14 50 7 70 14 83 28 89 46 78 54 63 50 50 56 36 50 21 54Z" :fill="paint('glass')"/>
        <path d="m17 28 13-14 20-7-15 21-9 19-15-1Z" fill="#d8c3ff" opacity=".65"/>
        <path d="m50 7 20 7 13 14-19-1-14-8Z" fill="#be9bf5" opacity=".9"/>
        <path d="m35 28 15-9 14 8 11 22-12 1-13 6-14-6-10-3Z" fill="#6978dd" opacity=".55"/>
        <path d="m39 33 11-8 12 8 6 15-18 6-17-6Z" :fill="paint('violet')" opacity=".8"/>
        <path d="M12 46 21 51 36 47 50 53 63 47 78 51 88 46" stroke="#dcd4ff" stroke-width="2.5"/>
        <path d="m28 22 10-8 12-3" stroke="#fff0ff" stroke-width="2" opacity=".8"/>
        <circle cx="29" cy="35" r="2" fill="#e9daff" opacity=".8"/>
      </template>
      <template v-else-if="id === 'bilateral'">
        <path d="M50 7 70 17 80 35 78 57 65 80 50 95 35 80 22 57 20 35 30 17Z" :fill="paint('teal')"/>
        <path d="m50 7-7 27 7 56-15-10-13-23-2-22 10-18Z" fill="#a4f5e4"/>
        <path d="m50 7 20 10 10 18-2 22-13 23-15 15 8-58Z" fill="#327cba"/>
        <path d="M50 13 57 34 54 76 50 91 46 76 43 34Z" :fill="paint('gold')"/>
        <g v-for="(y,i) in [32,44,56,68]" :key="y" :transform="`translate(50 ${y})`"><path :d="`M-7-4 ${-23+i*3} 0 ${-19+i*3} 7-6 3Z`" fill="#48b9ba"/><path :d="`M7-4 ${23-i*3} 0 ${19-i*3} 7 6 3Z`" fill="#79d5d4"/></g>
        <path d="m35 21 7-2 2 7-6 3-5-3Zm23-2 7 2 2 5-5 3-6-3Z" fill="#324c86"/>
        <path d="m36 21 3 1-1 3-3-1Zm25 0 3 1-1 3-3-1Z" fill="#cdf9fa"/>
      </template>
      <template v-else-if="id === 'worm'">
        <path d="M18 72C-1 42 23 9 46 26 65 41 57 65 76 66 91 64 87 44 87 38" stroke="#873e5e" stroke-width="20"/>
        <g v-for="(segment,i) in worm" :key="i" :transform="`translate(${segment[0]} ${segment[1]}) rotate(${segment[2]})`">
          <path d="M-9-6-2-10 6-8 10-1 8 7 0 10-8 6Z" :fill="paint('orange')"/>
          <path d="m-9-6 7-4 8 2 4 7-8-3-11 4Z" fill="#ffe49d" opacity=".85"/>
          <path d="M-10 0-14 2-11 4M10 0l4 2-3 3" stroke="#f4b670" stroke-width="1.4"/>
        </g>
        <path d="m81 34 3-7 7-1 6 7-1 9-7 3-7-4Z" :fill="paint('coral')"/>
        <circle cx="85" cy="32" r="1.8" fill="#5d3d6c"/><circle cx="93" cy="32" r="1.8" fill="#5d3d6c"/>
      </template>
      <template v-else-if="id === 'trilobite'">
        <g fill="#e5b36a"><path v-for="(y,i) in [35,44,53,62,71]" :key="y" :d="`M${29+i} ${y} ${12+i*2} ${y+5} ${8+i*3} ${y+13} ${17+i*2} ${y+9} ${32+i} ${y+6}Z M${71-i} ${y} ${88-i*2} ${y+5} ${92-i*3} ${y+13} ${83-i*2} ${y+9} ${68-i} ${y+6}Z`"/></g>
        <path d="M50 8 68 12 81 28 79 48 70 70 51 92 30 71 21 48 19 28 32 12Z" :fill="paint('teal')"/>
        <path d="m32 12 18-4 18 4 13 16-22-6-18 0-22 6Z" fill="#9bf2dc"/>
        <path d="M27 33 42 28 58 28 73 33 72 45 67 62 51 84 33 63 28 46Z" fill="#216682"/>
        <g v-for="(y,i) in [34,44,54,64,74]" :key="y" :transform="`translate(50 ${y})`">
          <path :d="`M${-24+i*3}-3-8-6 8-6 ${24-i*3}-3 ${21-i*3} 5 8 3-8 3 ${-21+i*3} 5Z`" :fill="paint('teal')"/>
          <path d="M-8-6 0-9 8-6 7 3 0 6-7 3Z" :fill="paint('gold')"/>
          <path :d="`M${-24+i*3}-3-8-6M8-6 ${24-i*3}-3`" stroke="#a0efe0" stroke-width="1"/>
        </g>
        <path d="m41 14 9-3 9 3 4 12-13 5-13-5Z" :fill="paint('gold')"/>
        <path d="m28 24 6-3 4 3-2 6-7-1Zm38-3 6 3-1 5-7 1-2-6Z" fill="#153756"/>
        <circle cx="32" cy="24" r="1.5" fill="#e1ffff"/><circle cx="68" cy="24" r="1.5" fill="#e1ffff"/>
      </template>
      <template v-else-if="id === 'chordate'">
        <path d="m31 37 18-20 18 18-16 9Z" :fill="paint('blue')"/>
        <path d="m49 17 1 20 17-2Z" fill="#a3c8fa"/>
        <path d="m40 63 12 18 11-18Z" :fill="paint('gold')"/>
        <path d="m75 48 20-20-2 20 3 24-22-16Z" :fill="paint('teal')"/>
        <path d="m75 48 20-20-8 23 9 21-22-16Z" fill="#65d7df" opacity=".75"/>
        <path d="M5 49 19 35 39 29 60 34 81 50 63 65 41 71 20 64 7 56Z" :fill="paint('teal')"/>
        <path d="m5 49 14-14 20-6 21 5 21 16-26-5-29-1Z" fill="#91e9ed"/>
        <path d="m7 56 13 8 21 7 22-6 18-15-24 7-30 1Z" fill="#2676a3"/>
        <path d="m29 44 9 7-3 13-8-10Z" fill="#a2e7ed"/>
        <path d="m41 48 17 11-14 6-6-8Z" :fill="paint('gold')"/>
        <path d="m64 43 3 5-2 7M69 46l3 4-2 4" stroke="#d4f4e9" stroke-width="1" opacity=".8"/>
        <path d="m17 42 5-3 5 3-1 6-6 2-4-4Z" fill="#143557"/>
        <circle cx="21" cy="42" r="2" fill="#e5ffff"/>
        <path d="m8 53 8 1" stroke="#286282" stroke-width="1.5"/>
      </template>
      <template v-else-if="id === 'reef'">
        <path d="m9 85 18-9 45-1 20 12-15 9-47-1Z" fill="#4d7297"/>
        <path d="M43 88 43 49 29 33 28 13 19 9 20 36 33 52 33 87Z" :fill="paint('pink')"/>
        <path d="M28 32 12 24 9 12 3 14 7 31 23 40Z" :fill="paint('coral')"/>
        <path d="M42 55 56 38 56 16 64 9 69 14 64 21 64 41 43 68Z" :fill="paint('pink')"/>
        <path d="m59 35 16-9 5-13 7 2-5 18-20 12Z" :fill="paint('coral')"/>
        <path d="M38 87 39 19 46 10 51 13 47 23 48 84Z" :fill="paint('coral')"/>
        <path d="m43 39 12-14 0-11-6-1-1 10-7 7Z" fill="#ffcfb2"/>
        <path d="M65 89 62 64 72 51 72 40 79 37 80 54 70 66 74 89Z" :fill="paint('violet')"/>
        <path d="m65 72-13-8-3-13-6 2 4 17 20 12Z" :fill="paint('violet')"/>
        <path d="m72 60 15-5 7-14-6-2-6 10-11 3Z" :fill="paint('violet')"/>
        <path d="M23 89 21 66 11 58 8 47 14 44 18 55 29 61 32 88Z" :fill="paint('orange')"/>
        <path d="m24 73 13-10 1-12-6-1-1 9-9 6Z" :fill="paint('orange')"/>
        <path d="m20 12 3 22 12 16v31M43 20v58M64 64l6-8M12 49l3 10 10 7" stroke="#ffd2bd" stroke-width="1.5" opacity=".8"/>
      </template>
      <template v-else-if="id === 'ecosystem'">
        <path d="M33 7 62 6 85 23 95 48 87 76 66 94 37 94 14 78 5 52 12 25Z" :fill="paint('sea')"/>
        <path d="m12 25 21-18 29-1 23 17-35-8Z" fill="#a6eee6" opacity=".5"/>
        <path d="m14 78 23 16h29l21-18-25 7-27-7Z" fill="#253e7a"/>
        <path d="M11 60 28 51 51 57 73 48 92 54 87 76 66 94 37 94 14 78Z" fill="#306997" opacity=".65"/>
        <path d="m23 80 4-23-9-9 5-3 10 9 0 27Zm6-13 12-13 5 3-11 15Z" :fill="paint('coral')"/>
        <path d="m57 86 0-26 8-12 5 4-7 12 1 22Zm3-13 15-8 4 5-16 10Z" :fill="paint('pink')"/>
        <path d="M32 34 42 25 55 25 68 34 56 43 42 42Z" :fill="paint('gold')"/>
        <path d="m65 34 13-10-1 20Z" fill="#ffd275"/><path d="m32 34 10-9h13l13 9-20-3Z" fill="#fff0af"/>
        <circle cx="40" cy="32" r="2" fill="#554b70"/>
        <path d="m39 73 9-9 9 9-8 4Z" :fill="paint('violet')"/>
        <path d="m15 32 5-3 5 4-3 6-6-1Z" fill="#beeeeb" opacity=".8"/><circle cx="78" cy="46" r="3" fill="#a3e8f0" opacity=".75"/>
      </template>
      <use v-else :href="ref('cell')" transform="translate(50 50)"/>
    </g>
  </svg>
</template>

<style scoped>
.bio-icon { display: inline-block; flex: none; vertical-align: middle; overflow: visible; }
</style>
