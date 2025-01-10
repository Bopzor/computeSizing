import { createSignal, Show, type Component } from 'solid-js';

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

const sizingToWeeks: Record<Size, number> = {
  XS: 3 / 5,
  S: 1,
  M: 3,
  L: 6,
  XL: 14,
  XXL: 16,
};

type SizeString = Size | `${Size}/${Size}`;

const computeSizing = (sizes: [SizeString, ...SizeString[]]) => {
  const sizeCount: Record<Size, { min: number; max: number }> = {
    XS: { min: 0, max: 0 },
    S: { min: 0, max: 0 },
    M: { min: 0, max: 0 },
    L: { min: 0, max: 0 },
    XL: { min: 0, max: 0 },
    XXL: { min: 0, max: 0 },
  };

  for (const size of sizes) {
    if (size.includes('/')) {
      const minMaxSize = size.split('/');
      sizeCount[minMaxSize[0] as Size].min += 1;
      sizeCount[minMaxSize[1] as Size].max += 1;
    } else {
      sizeCount[size as Size].min += 1;
      sizeCount[size as Size].max += 1;
    }
  }

  let numberOfWeeksMin = 0;
  let numberOfWeeksMax = 0;

  for (const [size, { min, max }] of Object.entries(sizeCount)) {
    const ratio = sizingToWeeks[size as Size];

    numberOfWeeksMin += min * ratio;
    numberOfWeeksMax += max * ratio;
  }

  return {
    sizeMin: getSizingFromNumberOfWeeks(numberOfWeeksMin),
    sizeMax: getSizingFromNumberOfWeeks(numberOfWeeksMax),
  };
};

const getSizingFromNumberOfWeeks = (numberOfWeeks: number): Size => {
  let actualSize: Size = 'XXL';

  for (const [size, week] of Object.entries(sizingToWeeks).reverse()) {
    if (numberOfWeeks <= week) {
      actualSize = size as Size;
    }
  }

  return actualSize;
};

const App: Component = () => {
  const [size, setSize] = createSignal('');
  const [error, setError] = createSignal('');
  const [minComputedSize, setMinComputedSize] = createSignal('');
  const [maxComputedSize, setMaxComputedSize] = createSignal('');

  const handleSetSignal = (value: string) => {
    setSize(value);

    const sizes = value.replaceAll(',', ' ').replaceAll('  ', ' ').trim().split(' ');

    if (
      sizes.every(
        (size) =>
          Object.keys(sizingToWeeks).includes(size) ||
          size.split('/').every((s) => Object.keys(sizingToWeeks).includes(s))
      )
    ) {
      setError('');

      const computedSizes = computeSizing(sizes as [SizeString, ...SizeString[]]);
      setMinComputedSize(computedSizes.sizeMin);
      setMaxComputedSize(computedSizes.sizeMax);
    } else {
      setError('Invalid formatting');
    }
  };

  return (
    <div class="flex flex-col items-center justify-center p-8 gap-4">
      <div class="flex flex-col gap-2 border-2 p-4 rounded-lg w-[256px] justify-center">
        <SizeWithDuration size="XS" duration={`<= 3 jours`} />
        <SizeWithDuration size="S" duration={`<= 1 semaine`} />
        <SizeWithDuration size="M" duration={`<= 1 Sprint`} />
        <SizeWithDuration size="L" duration={`<= 2 Sprints`} />
        <SizeWithDuration size="XL" duration={`<= 1 PI`} />
        <SizeWithDuration size="XXL" duration={`> 1 PI`} />
      </div>

      <div>
        <div class="text-gray-600 text-sm">
          <p>Enter the sizes to sums. The following formats are supported:</p>
          <ul class="list-disc list-inside">
            <li>"Size,Size/Size,Size,Size"</li>
            <li>"Size, Size, Size/Size, Size"</li>
            <li>"Size/Size Size Size Size"</li>
          </ul>
        </div>
        <div class="row h-12 min-h-12 w-full items-center overflow-hidden rounded-lg border-2 transition-colors focus-within:border-blue-800/50">
          <input
            class="size-full self-stretch bg-transparent px-4 outline-none"
            value={size()}
            onInput={(event) => handleSetSignal(event.target.value)}
          />
        </div>

        <Show when={!error()} fallback={<div class="text-red-700 text-sm">{error()}</div>}>
          <Show
            when={minComputedSize() === maxComputedSize()}
            fallback={
              <div class="mt-4">
                <div class="text-center">The Sizing is</div>
                <div class="flex justify-between gap-4">
                  <div class="flex items-center gap-2">
                    Min: <SizeComponent size={minComputedSize() as Size} />
                  </div>
                  <div class="flex items-center gap-2">
                    Max: <SizeComponent size={maxComputedSize() as Size} />
                  </div>
                </div>
              </div>
            }
          >
            <SizeComponent size={minComputedSize() as Size} />
          </Show>
        </Show>
      </div>
    </div>
  );
};

const SizeComponent = (props: { size: Size }) => {
  return (
    <div
      class={
        'flex size-9 justify-center items-center rounded-full text-center text-white font-bold'
      }
      classList={{
        'bg-blue-700': props.size === 'XS',
        'bg-green-950': props.size === 'S',
        'bg-yellow-500': props.size === 'M',
        'bg-amber-700': props.size === 'L',
        'bg-red-800': props.size === 'XL',
        'bg-orange-950': props.size === 'XXL',
      }}
    >
      {props.size}
    </div>
  );
};

const SizeWithDuration = (props: { size: Size; duration: string }) => {
  return (
    <div class="flex gap-4 items-center">
      <SizeComponent size={props.size} />
      <div>{props.duration}</div>
    </div>
  );
};

export default App;
