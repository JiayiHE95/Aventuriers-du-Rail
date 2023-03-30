<script>
    import { ws } from "./stores.js";
    import Log from "./Log.svelte";
    export let props;
    export let logLines;

    function send(message) {
        console.log(`Message: "${message}"`);
        $ws.send(message);
    }
</script>

<div id="piles" class="row">
    <div class="column">
        <div id="cartes-visibles" class="row">
            {#each props.cartesWagonVisibles as couleur}
                <div class="carte visible column">
                    <img
                        class="shadow"
                        alt={couleur}
                        src="images/carte-wagon-{couleur}.png"
                        on:click={() => send(couleur)}
                    />
                    <span>{couleur[0] + couleur.slice(1).toLowerCase()}</span>
                </div>
            {/each}
        </div>
        <Log lines={logLines} />
    </div>
    <div id="pile-cartes-wagon" class="carte column">
        <img
            class="shadow"
            alt="wagon"
            src="images/carte-wagon.png"
            on:click={() => send("GRIS")}
        />
        <span>Cartes wagon ({props.pileCartesWagon})</span>
    </div>
    <div class="carte column">
        {#if props.defausseCartesWagon.length === 0}
            <div class="carte-stub" />
        {:else}
            <div id="defausse-cartes-wagon" class="carte column">
                {#each props.defausseCartesWagon.slice(-15) as couleur}
                    <img
                        class="shadow"
                        alt={couleur}
                        src="images/carte-wagon-{couleur}.png"
                    />
                {/each}
            </div>
        {/if}
        <span>Défausse ({props.defausseCartesWagon.length})</span>
    </div>
    <div id="pile-destinations" class="carte column">
        <img
            class="shadow"
            alt="destinations"
            src="images/eu_TicketBack.png"
            on:click={() => send("destinations")}
        />
        <span>Destinations ({props.pileDestinations})</span>
    </div>
</div>

<style>
    #piles {
        justify-content: space-around;
    }
    .carte {
        width: 100px;
        font-size: 0.8em;
        text-align: center;
    }
    .carte-stub {
        width: 100px;
        height: 67px;
        margin-bottom: 5px;
    }
    .carte img {
        margin-bottom: 5px;
        border-radius: 4px;
        border: 1px var(--col-dark) solid;
        box-shadow: 2px 2px 2px var(--col-dark);
    }
    #cartes-visibles {
        width: 500px;
        height: 89px;
        flex-direction: row-reverse;
    }
    #defausse-cartes-wagon {
        flex-direction: column-reverse;
    }
    #defausse-cartes-wagon img {
        margin-top: -55px;
        display: none;
    }
    #defausse-cartes-wagon:hover img {
        display: block;
    }
    #defausse-cartes-wagon img:last-child {
        margin-top: 0;
        display: block;
    }
    #pile-destinations,
    #pile-cartes-wagon {
        margin-left: 10px;
    }
</style>
