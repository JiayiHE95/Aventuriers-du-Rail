<script>
  import { beforeUpdate } from "svelte";
  
    import { villesData, routesData } from "./plateau_data.js";
    import { ws } from "./stores.js";
    export let props;
  
    const LONGUEUR_SEGMENT = 60;
    const LARGEUR_SEGMENT = 20;
    const TAILLE_WAGON = 70;
    const TAILLE_GARE = 50;
    const RAYON_VILLE = 12;
  
    function toggleTracks() {
      const cache = document.getElementById("cache");
      if (cache.style.visibility === "hidden") {
        cache.style.visibility = "";
      } else {
        cache.style.visibility = "hidden";
      }
    }
  
    function send(message) {
        console.log(`Message: "${message}"`);
        $ws.send(message);
    }

    class Ville {
      constructor(nom, x, y) {
        this.nom = nom;
        this.x = x;
        this.y = y;
        this.proprietaire = undefined;
      }
    }
  
    class Route {
      constructor(ville1, ville2, longueur, couleur, isTunnel, ferry, segments) {
        this.ville1 = ville1;
        this.ville2 = ville2;
        this.longueur = longueur;
        this.couleur = couleur;
        this.isTunnel = isTunnel;
        this.ferry = ferry;
        this.label = `${ville1} - ${ville2}`;
        this.segments = segments;
        this.proprietaire = undefined;
      }
    }
  
    const villes = Object.values(villesData).map(
      (data) => new Ville(data.nom, data.x, data.y)
    );
  
    const routes = routesData.map(
      (data) =>
        new Route(
          data.ville1,
          data.ville2,
          data.longueur,
          data.couleur,
          data.isTunnel,
          data.ferry,
          data.segments
        )
    );
  
    // Corriger les labels des routes multiples
    for (let i = 0; i < routes.length - 1; i++) {
      if (routes[i].label === routes[i + 1].label) {
        routes[i].label += "(1)";
        routes[i + 1].label += "(2)";
      }
    }
  
    beforeUpdate(() => {
      for (const routeData of props.routes) {
        if (routeData.proprietaire) {
          routes.filter((r) => r.label === routeData.nom)[0].proprietaire =
            routeData.proprietaire;
        }
      }
      for (const villeData of props.villes) {
        if (villeData.proprietaire) {
          villes.filter((v) => v.nom === villeData.nom)[0].proprietaire =
            villeData.proprietaire;
        }
      }
      routes=routes;
      villes=villes;
    });
  </script>
  
  <svg
    id="board"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 1701 1097"
  >
    <!-- Dessin des routes -->
    {#each routes as route}
      <g
        class="route"
        on:click={() => send(route.label)}
      >
        {#each route.segments as segment, i}
          <g
            class="segment"
            transform="translate({segment.x}, {segment.y})
            rotate({(Math.atan2(segment.dy, segment.dx) * 180) / Math.PI})"
          >
            <rect
              x={-LONGUEUR_SEGMENT / 2}
              y={-LARGEUR_SEGMENT / 2}
              width={LONGUEUR_SEGMENT}
              height={LARGEUR_SEGMENT}
            />
          </g>
        {/each}
      </g>
    {/each}
  
    <!-- Cercles cliquables des villes -->
    {#each villes as ville}
      <g
        class="ville"
        transform="translate({ville.x}, {ville.y})"
        on:click={() => send(ville.nom)}
      >
        <circle cx="0" cy="0" r={RAYON_VILLE} />
      </g>
    {/each}
  
    <!-- Rectangle pour faire ressortir les pièces des joueurs -->
    <rect
      id="cache"
      class="no-pointer"
      x="0"
      y="0"
      width="1701"
      height="1097"
      fill="#fffc"
      style="visibility: hidden"
    />
  
    <!-- Routes capturées par les joueurs -->
    {#each routes as route}
      <g class="no-pointer">
        {#each route.segments as segment, i}
          {#if route.proprietaire !== undefined}
            <g
              transform="translate({segment.x}, {segment.y})
              rotate({(Math.atan2(segment.dy, segment.dx) * 180) / Math.PI})"
            >
              <image
                xlink:href="images/image-wagon-{route.proprietaire}.png"
                width={TAILLE_WAGON}
                height={TAILLE_WAGON}
                transform="translate({-TAILLE_WAGON * 0.55}, {-TAILLE_WAGON / 2})"
              />
            </g>
          {/if}
        {/each}
      </g>
    {/each}
  
    <!-- Gares construites par les joueurs -->
    {#each villes as ville}
      {#if ville.proprietaire !== undefined}
        <g class="no-pointer" transform="translate({ville.x}, {ville.y})">
          <image
            xlink:href="images/gare-shadow.png"
            width={TAILLE_GARE * 1.05}
            height={TAILLE_GARE * 1.05}
            transform="translate({-TAILLE_GARE * 0.55}, {-TAILLE_GARE * 0.75})"
          />
          <image
            xlink:href="images/gare-{ville.proprietaire}.png"
            width={TAILLE_GARE}
            height={TAILLE_GARE}
            transform="translate({-TAILLE_GARE * 0.6}, {-TAILLE_GARE * 0.7})"
          />
        </g>
      {/if}
    {/each}
  
    <!-- Bouton pour alterner l'affichage -->
    <image xlink:href="images/toggle-button.png" x=0 y = 0 width="80" height="80" on:click={toggleTracks}/>
  </svg>
  
  <style>
    #board {
      background: url(images/euMap.jpg);
      background-size: contain;
      width: 850px;
      height: 548px;
      border: 1px var(--col-dark) solid;
      border-radius: 8px;
      box-shadow: 2px 2px 2px var(--col-dark);
    }
    .ville {
      stroke: none;
      fill: #0000;
    }
    .route {
      stroke: none;
      fill: #0000;
    }
    .no-pointer {
      pointer-events: none;
    }
  </style>
  