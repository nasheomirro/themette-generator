<script lang="ts">
  import { fly } from "svelte/transition";
  import { mode, toggleMode } from "mode-watcher";

  import ThemetteLogo from "~icons/lucide/box";
  import GithubLogo from "~icons/lucide/github";
  import SunIcon from "~icons/lucide/sun";
  import MoonIcon from "~icons/lucide/moon";
</script>

<nav
  class="h-14 flex items-center py-2.5 md:pt-3 border-b border-th-bg-100-900 fixed top-0 left-0 w-full bg-th-bg-50-950 z-40"
>
  <ul class="px-4 md:px-6 lg:px-8 centered-container flex items-center grow gap-1">
    <li>
      <ThemetteLogo />
    </li>
    <li class="ml-auto">
      <a class="btn" href="https://github.com/nasheomirro">
        <GithubLogo />
      </a>
    </li>
    <li>
      <button class="btn grid" onclick={toggleMode}>
        {#if mode.current === "dark"}
          <span class="col-start-1 row-start-1" in:fly={{ y: -10, delay: 100 }} out:fly={{ y: -10 }}>
            <MoonIcon />
          </span>
        {:else}
          <span class="col-start-1 row-start-1" in:fly={{ y: 10, delay: 100 }} out:fly={{ y: 10 }}>
            <SunIcon />
          </span>
        {/if}
      </button>
    </li>
  </ul>
</nav>
