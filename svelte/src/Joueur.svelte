<script>
    import { ws } from "./stores.js";
    export let props;

    function send(message) {
        console.log(`Message: "${message}"`);
        $ws.send(message);
    }
</script>

<div class="joueur {props.couleur} {props.estJoueurCourant ? 'actif' : ''}">
    <div class="header row">
        <img
            class="avatar"
            alt="avatar {props.couleur}"
            src="images/avatar-{props.couleur}.png"
        />
        <div class="info column">
            <span class="nom">{props.nom}</span>
            <div class="score">Score: {props.score}</div>
            <div class="gares">Gares: {props.nbGares}</div>
            <div class="wagons">Wagons: {props.nbWagons}</div>
        </div>
    </div>
    <div class="secret">
        <div class="destinations column">
            {#each props.destinations as destination}
                <div
                    class="destination"
                    on:click={() => send(destination.nom)}
                >
                    {destination.ville1} - {destination.ville2} ({destination.valeur})
                </div>
            {/each}
        </div>
        <div class="cartes-wagon">
            {#each props.cartesWagon as wagon}
                <div
                    class="carte-wagon {wagon}"
                    on:click={() => send(wagon)}
                >
                    <div
                        class="image-wagon"
                        style="background-image: url(images/carte-wagon-{wagon}.png"
                    />
                </div>
            {/each}
        </div>
        <div class="cartes-wagon">
            {#each props.cartesWagonPosees as wagon}
                <div class="carte-wagon {wagon}">
                    <div
                        class="image-wagon"
                        style="background-image: url(images/carte-wagon-{wagon}.png"
                    />
                    <div class="overlay" />
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .joueur {
        color: var(--col-dark);
        border: 1px solid var(--col-dark);
        border-radius: 8px;
        width: 280px;
        padding: 4px;
        margin-left: 4px;
        margin-bottom: 4px;
        box-shadow: 2px 2px 2px var(--col-dark);
    }
    .joueur.BLEU {
        background: var(--col-light-BLEU);
    }
    .joueur.VERT {
        background: var(--col-light-VERT);
    }
    .joueur.ROSE {
        background: var(--col-light-ROSE);
    }
    .joueur.ROUGE {
        background: var(--col-light-ROUGE);
    }
    .joueur.JAUNE {
        background: var(--col-light-JAUNE);
    }
    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 4px;
    }
    .info {
        width: 100%;
    }
    .nom {
        width: 100%;
        text-align: center;
        font-size: 1.5em;
        font-weight: bold;
    }
    .avatar {
        height: 84px;
        width: 66px;
    }
    .secret {
        display: none;
    }
    .joueur:hover .secret,
    .joueur.actif .secret {
        display: block;
    }
    .destinations {
        align-content: right;
    }
    .cartes-wagon {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        width: 250px;
    }
    .carte-wagon {
        border: 1px solid var(--col-dark);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
        width: calc(248px * 0.3);
        height: calc(160px * 0.3);
        padding: 0;
        margin-right: -42px;
    }
    .carte-wagon .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--col-dark);
        opacity: 0.5;
    }
    .image-wagon {
        width: 100%;
        height: 100%;
        background-size: cover;
    }
</style>
