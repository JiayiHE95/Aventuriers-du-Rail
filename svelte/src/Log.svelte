<script>
    import { afterUpdate } from "svelte";
    export let lines;

    function scrollToBottom() {
        const logElement = document.getElementById("inner-log");
        logElement.scrollTop = logElement.scrollHeight;
    }

    afterUpdate(scrollToBottom);
</script>

<div id="log">
    <div id="inner-log">
        {#each lines as line}
            <pre>{@html line}</pre>
        {/each}
    </div>
</div>

<style>
    #log {
        margin: 5px 0;
        padding: 10px 30px 12px 26px;
        width: 408px;
        height: 263px;
        font-family: monospace;
        background: url(images/dialogue-box_Big.png);
        background-size: cover;
    }

    #inner-log {
        padding: 0px;
        /* border: solid 1px black; */
        height: 100%;
        overflow: overlay;
    }

    ::-webkit-scrollbar {
        background-color: transparent;
    }
</style>
