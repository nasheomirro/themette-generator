<script lang="ts">
  import type { Component } from "svelte";
  import { RadioGroup } from "bits-ui";

  import { panel } from "./panels.svelte";

  import EditorIcon from "~icons/lucide/palette";
  import PreviewIcon from "~icons/lucide/eye";
  import GeneratedIcon from "~icons/lucide/braces";

  const icons: { [K in typeof panel.mobile]: Component } = {
    generated: GeneratedIcon,
    editor: EditorIcon,
    preview: PreviewIcon,
  };
</script>

{#snippet item(name: string, value: typeof panel.mobile)}
  <RadioGroup.Item
    class="grow text-sm font-light flex items-center justify-center flex-col gap-0.5 data-[state=checked]:text-th-fg-800-200 transition"
    {value}
  >
    {@const Icon = icons[value]}
    <Icon />
    <span class="text-xs">{name}</span>
  </RadioGroup.Item>
{/snippet}

<RadioGroup.Root
  bind:value={panel.mobile}
  class="fixed md:hidden bg-th-bg-50-950 flex items-center left-0 bottom-0 z-40 w-full h-16 border-t border-t-th-bg-100-900"
>
  {#snippet child({ props })}
    <nav {...props}>
      {@render item("Colors", "editor")}
      {@render item("Preview", "preview")}
      {@render item("Code", "generated")}
    </nav>
  {/snippet}
</RadioGroup.Root>
