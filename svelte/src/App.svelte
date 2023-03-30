<script>
  import Plateau from "./Plateau.svelte";
  import Joueur from "./Joueur.svelte";
  import Prompt from "./Prompt.svelte";
  import Piles from "./Piles.svelte";

  import { ws } from "./stores.js";
  let data;

  $ws.onmessage = function (event) {
    data = JSON.parse(event.data);
    console.log(data);
  };
</script>

{#if data}
  <main>
    <div id="main">
      <Plateau props={{villes: data.villes, routes: data.routes}} />
      <div>
        <Prompt props={data.prompt} />
        <Piles props={data.piles} logLines={data.log} />
      </div>
    </div>
    <div class="joueurs">
      {#each data.joueurs as props}
        <Joueur {props} />
      {/each}
    </div>
  </main>
{:else}
  <p>La connexion avec le serveur n'a pas pu être établie.</p>
  <p>Démarrez le serveur et rechargez la page.</p>
{/if}

<style>
  main {
    display: flex;
    flex-direction: row;
  }
  .joueurs {
    float: right;
  }
</style>
