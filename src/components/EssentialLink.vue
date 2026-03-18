<template>
  <q-item
    v-if="isExternalLink(link)"
    clickable
    tag="a"
    target="_blank"
    :href="link"
    class="app-nav-item"
  >
    <q-item-section v-if="icon" avatar class="app-nav-item__avatar">
      <div class="app-nav-item__icon-wrap">
        <q-icon :name="icon" />
      </div>
    </q-item-section>

    <q-item-section>
      <q-item-label class="app-nav-item__title">{{ title }}</q-item-label>
      <q-item-label caption class="app-nav-item__caption">{{ caption }}</q-item-label>
    </q-item-section>

    <q-item-section side class="app-nav-item__chevron">
      <q-icon name="north_east" size="18px" />
    </q-item-section>
  </q-item>

  <q-item
    v-else
    clickable
    exact
    :to="link"
    class="app-nav-item"
    active-class="app-nav-item--active"
  >
    <q-item-section v-if="icon" avatar class="app-nav-item__avatar">
      <div class="app-nav-item__icon-wrap">
        <q-icon :name="icon" />
      </div>
    </q-item-section>

    <q-item-section>
      <q-item-label class="app-nav-item__title">{{ title }}</q-item-label>
      <q-item-label caption class="app-nav-item__caption">{{ caption }}</q-item-label>
    </q-item-section>

    <q-item-section side class="app-nav-item__chevron">
      <q-icon name="chevron_right" size="18px" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});

function isExternalLink(url: string): boolean {
  return /^(https?:)?\/\//.test(url);
}
</script>
