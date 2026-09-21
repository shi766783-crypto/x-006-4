<script setup lang="ts">
import { computed, ref } from 'vue'
import CheckupForm from '../components/checkup/CheckupForm.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useFamilyStore } from '../stores/useFamilyStore'
import type { CheckupReport } from '../types'
import { formatDate } from '../utils/date'

const store = useFamilyStore()
const showForm = ref(false)
const filterMember = ref('all')

const filtered = computed(() => {
  const list =
    filterMember.value === 'all'
      ? store.state.checkups
      : store.state.checkups.filter((r) => r.memberId === filterMember.value)
  return [...list].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
})

function memberName(id: string) {
  return store.getMember(id)?.name ?? '未知成员'
}

function onSave(data: Omit<CheckupReport, 'id' | 'createdAt'>) {
  store.addCheckup(data)
  showForm.value = false
}

function onDelete(report: CheckupReport) {
  if (window.confirm(`确定删除「${memberName(report.memberId)}」${formatDate(report.date)}的体检报告吗？`)) {
    store.deleteCheckup(report.id)
  }
}

// ---- image lightbox ----
const lightboxImages = ref<string[]>([])
const lightboxIndex = ref(0)

function openLightbox(report: CheckupReport, index: number) {
  lightboxImages.value = report.images
  lightboxIndex.value = index
}

function prevImage() {
  lightboxIndex.value =
    (lightboxIndex.value - 1 + lightboxImages.value.length) % lightboxImages.value.length
}

function nextImage() {
  lightboxIndex.value = (lightboxIndex.value + 1) % lightboxImages.value.length
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1 class="page-title">体检报告归档</h1>
      <button type="button" class="btn btn-primary" @click="showForm = true">＋ 归档体检报告</button>
    </div>

    <!-- Filter -->
    <section class="card filters-card">
      <div class="filter-group">
        <label class="form-label">成员</label>
        <select v-model="filterMember" class="input">
          <option value="all">全部成员</option>
          <option v-for="m in store.state.members" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>
      <div class="filter-summary">
        共 {{ filtered.length }} 份报告
      </div>
    </section>

    <div v-if="filtered.length" class="report-list">
      <div v-for="r in filtered" :key="r.id" class="report-item card">
        <div class="report-head">
          <div class="report-title">
            <strong>{{ memberName(r.memberId) }}</strong>
            <span class="report-date">{{ formatDate(r.date) }}</span>
          </div>
          <button type="button" class="btn btn-sm btn-danger-ghost" @click="onDelete(r)">删除</button>
        </div>
        <div class="report-meta">🏥 {{ r.hospital }}</div>
        <div v-if="r.conclusion" class="report-conclusion">
          <label>关键结论：</label>
          <p>{{ r.conclusion }}</p>
        </div>
        <div v-if="r.images.length" class="report-images">
          <img
            v-for="(img, i) in r.images"
            :key="i"
            :src="img"
            :alt="`体检报告图片 ${i + 1}`"
            @click="openLightbox(r, i)"
          />
        </div>
      </div>
    </div>
    <EmptyState v-else icon="📋" :text="store.state.checkups.length ? '该成员暂无体检报告' : '暂无体检报告，点击右上角归档第一份'" />
  </div>

  <BaseModal v-if="showForm" title="归档体检报告" @close="showForm = false">
    <CheckupForm @save="onSave" @close="showForm = false" />
  </BaseModal>

  <!-- Image lightbox -->
  <Teleport to="body">
    <div
      v-if="lightboxImages.length"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      @click.self="lightboxImages = []"
    >
      <button type="button" class="lightbox-close" aria-label="关闭" @click="lightboxImages = []">
        ×
      </button>
      <img
        :src="lightboxImages[lightboxIndex]"
        :alt="`体检报告图片 ${lightboxIndex + 1}`"
        class="lightbox-img"
      />
      <template v-if="lightboxImages.length > 1">
        <button type="button" class="lightbox-nav lightbox-prev" aria-label="上一张" @click="prevImage">
          ‹
        </button>
        <button type="button" class="lightbox-nav lightbox-next" aria-label="下一张" @click="nextImage">
          ›
        </button>
        <div class="lightbox-counter">{{ lightboxIndex + 1 }} / {{ lightboxImages.length }}</div>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-title {
  margin: 0;
}
.filters-card {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.filter-group .input {
  min-width: 160px;
}
.filter-summary {
  color: var(--text-secondary);
  font-size: 13px;
}
.report-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.report-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.report-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.report-date {
  color: var(--text-secondary);
  font-size: 13px;
}
.report-meta {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 6px;
}
.report-conclusion {
  font-size: 14px;
  margin-top: 8px;
  color: var(--text-primary);
  background: var(--bg-color);
  border-radius: 8px;
  padding: 10px 12px;
}
.report-conclusion label {
  color: var(--text-secondary);
  font-size: 13px;
}
.report-conclusion p {
  margin-top: 2px;
  white-space: pre-wrap;
}
.report-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.report-images img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: zoom-in;
  transition: transform 0.15s;
}
.report-images img:hover {
  transform: scale(1.04);
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 24px;
}
.lightbox-img {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 8px;
  object-fit: contain;
}
.lightbox-close {
  position: absolute;
  top: 16px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}
.lightbox-prev {
  left: 20px;
}
.lightbox-next {
  right: 20px;
}
.lightbox-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.4);
  padding: 3px 12px;
  border-radius: 12px;
}
</style>
