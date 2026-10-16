const slider = document.getElementById("color-slider");
const square = document.getElementById("color-square");
const hexValue = document.getElementById("hex-value");
const colorName = document.getElementById("color-name");
const copyButton = document.getElementById("copy-button");
const copyLabel = document.getElementById("copy-label");

const colorNames = [
  { max: 15, name: "Red" },
  { max: 45, name: "Orange" },
  { max: 70, name: "Amber" },
  { max: 90, name: "Yellow" },
  { max: 150, name: "Green" },
  { max: 180, name: "Cyan" },
  { max: 210, name: "Sky Blue" },
  { max: 250, name: "Blue" },
  { max: 280, name: "Violet" },
  { max: 315, name: "Magenta" },
  { max: 345, name: "Pink" },
  { max: 359, name: "Red" }
];

function hueToHex(hue) {
  const h = hue / 60;
  const chroma = 1;
  const x = chroma * (1 - Math.abs((h % 2) - 1));

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 1) {
    r = chroma;
    g = x;
  } else if (h < 2) {
    r = x;
    g = chroma;
  } else if (h < 3) {
    g = chroma;
    b = x;
  } else if (h < 4) {
    g = x;
    b = chroma;
  } else if (h < 5) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const toHex = (value) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function getColorName(hue) {
  const match = colorNames.find((color) => hue <= color.max);
  return match ? match.name : "Red";
}

function updateColor() {
  const hue = Number(slider.value);
  const hex = hueToHex(hue);

  square.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
  square.setAttribute("aria-label", `${getColorName(hue)} color preview`);

  hexValue.textContent = hex;
  colorName.textContent = getColorName(hue);

  // Update the browser theme color on supported mobile browsers.
  const themeColor = document.querySelector(
    'meta[name="theme-color"]'
  );

  if (themeColor) {
    themeColor.setAttribute("content", hex);
  }

  copyLabel.textContent = "Copy HEX";
}

slider.addEventListener("input", updateColor);

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(hexValue.textContent);
    copyLabel.textContent = "Copied!";

    setTimeout(() => {
      copyLabel.textContent = "Copy HEX";
    }, 1500);
  } catch {
    copyLabel.textContent = "Copy unavailable";
  }
});

// Set the initial color.
updateColor();


(() => {
  const image = document.getElementById("pokemon-image");
  const name = document.getElementById("pokemon-name");
  const number = document.getElementById("pokemon-number");
  const previousButton = document.getElementById("pokemon-prev");
  const nextButton = document.getElementById("pokemon-next");
  const status = document.getElementById("pokemon-status");

  if (
    !image || !name || !number ||
    !previousButton || !nextButton || !status
  ) {
    return;
  }

  const MAX_POKEMON = 1025;
  let currentPokemon = 1;
  let requestNumber = 0;

  async function showPokemon(id) {
    currentPokemon = id;
    const thisRequest = ++requestNumber;

    previousButton.disabled = true;
    nextButton.disabled = true;
    status.textContent = "Loading Pokémon...";

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${id}`
      );

      if (!response.ok) {
        throw new Error("Pokémon request failed");
      }

      const pokemon = await response.json();

      // Ignore outdated responses if another request has started.
      if (thisRequest !== requestNumber) return;

      const sprite = pokemon.sprites.front_default;

      if (!sprite) {
        throw new Error("No image available for this Pokémon");
      }

      image.src = sprite;
      image.alt = pokemon.name;
      name.textContent = pokemon.name;
      number.textContent = `Pokémon #${pokemon.id}`;
      status.textContent = "";

    } catch (error) {
      if (thisRequest !== requestNumber) return;

      status.textContent =
        "Couldn't load Pokémon. Please try again.";
      console.error(error);

    } finally {
      if (thisRequest === requestNumber) {
        previousButton.disabled = false;
        nextButton.disabled = false;
      }
    }
  }

  previousButton.addEventListener("click", () => {
    const previousId =
      currentPokemon <= 1
        ? MAX_POKEMON
        : currentPokemon - 1;

    showPokemon(previousId);
  });

  nextButton.addEventListener("click", () => {
    const nextId =
      currentPokemon >= MAX_POKEMON
        ? 1
        : currentPokemon + 1;

    showPokemon(nextId);
  });

  // Load the first Pokémon from the API.
  showPokemon(1);
})();
