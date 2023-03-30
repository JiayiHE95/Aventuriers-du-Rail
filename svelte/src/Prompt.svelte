<script>
    export let props;
    import { ws } from "./stores.js";

    function send(message) {
        console.log(`Message: "${message}"`);
        $ws.send(message);
    }
</script>

<div class="prompt">
    <div class="instruction">
    <span class="nom-joueur">{props.nomJoueurCourant}:</span>
    {props.instruction}
    </div>
    <div class="boutons">
        {#each props.boutons as bouton}
            <button
                class="btn btn-primary"
                on:click={() => send(bouton)}
                >{bouton}</button
            >
        {/each}
        {#if props.peutPasser}
            <button on:click={() => send("")}>Passer</button>
        {:else}
            <button disabled>Passer</button>
        {/if}
    </div>
</div>

<style>
    .nom-joueur {
        font-weight: bold;
    }
</style>
