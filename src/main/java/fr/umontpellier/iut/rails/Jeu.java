package fr.umontpellier.iut.rails;

import com.google.gson.Gson;
import fr.umontpellier.iut.gui.GameServer;

import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.stream.Collectors;

public class Jeu implements Runnable {
    /**
     * Liste des joueurs
     */
    private List<Joueur> joueurs;

    /**
     * Le joueur dont c'est le tour
     */
    private Joueur joueurCourant;
    /**
     * Liste des villes représentées sur le plateau de jeu
     */
    private List<Ville> villes;
    /**
     * Liste des routes du plateau de jeu
     */
    private List<Route> routes;
    /**
     * Pile de pioche (face cachée)
     */
    private List<CouleurWagon> pileCartesWagon;
    /**
     * Cartes de la pioche face visible (normalement il y a 5 cartes face visible)
     */
    private List<CouleurWagon> cartesWagonVisibles;
    /**
     * Pile de cartes qui ont été défaussée au cours de la partie
     */
    private List<CouleurWagon> defausseCartesWagon;
    /**
     * Pile des cartes "Destination" (uniquement les destinations "courtes", les
     * destinations "longues" sont distribuées au début de la partie et ne peuvent
     * plus être piochées après)
     */
    private List<Destination> pileDestinations;
    /**
     * File d'attente des instructions recues par le serveur
     */
    private BlockingQueue<String> inputQueue;
    /**
     * Messages d'information du jeu
     */
    private List<String> log;

    public Jeu(String[] nomJoueurs) {
        /*
         * ATTENTION : Cette méthode est à réécrire.
         * 
         * Le code indiqué ici est un squelette minimum pour que le jeu se lance et que
         * l'interface graphique fonctionne.
         * Vous devez modifier ce code pour que les différents éléments du jeu soient
         * correctement initialisés.
         */
        // initialisation list joueurs
//        joueurs = nomJoueurs;

        // initialisation des entrées/sorties
        inputQueue = new LinkedBlockingQueue<>();
        log = new ArrayList<>();

        // création des cartes
        pileCartesWagon = new ArrayList<>();
        for (int i=0; i<12; i++)pileCartesWagon.addAll(CouleurWagon.getCouleursSimples());
        for(int i=0; i<14; i++)pileCartesWagon.add(CouleurWagon.LOCOMOTIVE);
        Collections.shuffle(pileCartesWagon);

        // création des joueurs //presque correct
        ArrayList<Joueur.Couleur> couleurs = new ArrayList<>(Arrays.asList(Joueur.Couleur.values()));
        Collections.shuffle(couleurs);
        joueurs = new ArrayList<>();
        for (String nom : nomJoueurs) {
            Joueur joueur = new Joueur(nom, this, couleurs.remove(0));
            joueurs.add(joueur);
        }
        joueurCourant = joueurs.get(0);

        // Distribution des 4 cartes wagon par joueur
        for(int i=0; i<4; i++){
            for(Joueur joueur: joueurs){
                CouleurWagon carteTiree = pileCartesWagon.get(0);
                pileCartesWagon.remove(0);
                joueur.getCartesWagon().add(carteTiree);
            }
        }

        defausseCartesWagon = new ArrayList<>();

        // remplissage cartesWagonVisibles
        cartesWagonVisibles = new ArrayList<>();
        do{
            changerAllCarteWagonVisible();
        }while(!locomotiveVisibleInferieurTrois(cartesWagonVisibles));

        pileDestinations = new ArrayList<>(Destination.makeDestinationsEurope());

        // création des villes et des routes
        Plateau plateau = Plateau.makePlateauEurope();
        villes = plateau.getVilles();
        routes = plateau.getRoutes();
    }

    public List<CouleurWagon> getPileCartesWagon() {
        return pileCartesWagon;
    }

    public List<CouleurWagon> getCartesWagonVisibles() {
        return cartesWagonVisibles;
    }

    public List<Ville> getVilles() {
        return villes;
    }

    public List<Route> getRoutes() {
        return routes;
    }

    public Joueur getJoueurCourant() {
        return joueurCourant;
    }

    /**
     * Exécute la partie
     */
    public void run() {
        /*
         * ATTENTION : Cette méthode est à réécrire.
         * 
         * Cette méthode doit :
         * - faire choisir à chaque joueur les destinations initiales qu'il souhaite
         * garder : on pioche 3 destinations "courtes" et 1 destination "longue", puis
         * le joueur peut choisir des destinations à défausser ou passer s'il ne veut plus
         * en défausser. Il doit en garder au moins 2.
         *
         * - exécuter la boucle principale du jeu qui fait jouer le tour de chaque
         * joueur à tour de rôle jusqu'à ce qu'un des joueurs n'ait plus que 2 wagons ou
         * moins
         * - exécuter encore un dernier tour de jeu pour chaque joueur après
         */

        //Début du jeu : on mélange les piledestionation courte et longue puis
        //distribuer à chaque joueur 3 destinations courtes et 1 longue
        Collections.shuffle(pileDestinations);
        ArrayList<Destination> destinationLongue
                =new ArrayList<>(Destination.makeDestinationsLonguesEurope());
        Collections.shuffle(destinationLongue);
        log("Avant de commencer la partie, veuillez défausser des destinations");
        for(Joueur j : joueurs){
            joueurCourant=j;
            j.log("========== "+j.toLog()+" ==========");
            ArrayList<Destination> destinationsPossibles=new ArrayList<>();
            destinationsPossibles.add(piocherDestination());
            destinationsPossibles.add(piocherDestination());
            destinationsPossibles.add(piocherDestination());
            destinationsPossibles.add(Destination.makeDestinationsLonguesEurope()
                               .get(joueurs.indexOf(j)));
            j.choisirDestinations(destinationsPossibles,2);
            //joueur choisir les destions à défausser, il doit en garder minimum deux
        }
        log(" ");
        log("********** La partie commence ! **********");

        while(true) {
            for (Joueur j : joueurs) {
                //fait jouer le tour de chaque joueur à tour de rôle
                joueurCourant = j;
                j.log("========== "+j.toLog()+" ==========");
                j.jouerTour();
                //si après le tour du joueur courant il n'a que 2 wagons(ou moins), on passe un dernier tours()
                //on créer une liste de joueur qui doit passer son dernier tour
                if(j.getNbWagons()<=2){
                    ArrayList<Joueur> joueursDernierTour = new ArrayList<>();
                    for (int i = joueurs.indexOf(j) + 1; i < joueurs.size(); i++) {
                        joueursDernierTour.add(joueurs.get(i));
                    }
                    for (int i = 0; i <= joueurs.indexOf(j); i++) {
                        joueursDernierTour.add(joueurs.get(i));
                    }
                    //joueurs figurent sur cette liste dernier tour passe son tour
                    for (Joueur joueur : joueursDernierTour) {
                        joueurCourant=joueur;
                        joueur.jouerTour();
                    }
                    prompt("***** Fin de partie *****", new ArrayList<>(), false);
                    return;
                }
            }
        }
    }
        /**
         * Le code proposé ici n'est qu'un exemple d'utilisation des méthodes pour
         * interagir avec l'utilisateur, il n'a rien à voir avec le code de la partie et
         * doit donc être entièrement réécrit.
         */

        /* Exemple d'utilisation
        while (true) {
            // le joueur doit choisir une valeur parmi "1", "2", "3", "4", "6" ou "8"
            // les choix possibles sont présentés sous forme de boutons cliquables
            String choix = joueurCourant.choisir(
                    "Choisissez une taille de route.", // instruction
                    new ArrayList<>(), // choix (hors boutons, ici aucun)
                    new ArrayList<>(Arrays.asList("1", "2", "3", "4", "6", "8")), // boutons
                    false); // le joueur ne peut pas passer (il doit faire un choix)

            // une fois la longueur choisie, on filtre les routes pour ne garder que les
            // routes de la longueur choisie
            int longueurRoute = Integer.parseInt(choix);
            ArrayList<String> routesPossibles = new ArrayList<>();
            for (Route route : routes) {
                if (route.getLongueur() == longueurRoute) {
                    routesPossibles.add(route.getNom());
                }
            }

            // le joueur doit maintenant choisir une route de la longueur choisie (les
            // autres ne sont pas acceptées). Le joueur peut choisir de passer (aucun choix)
            String choixRoute = joueurCourant.choisir(
                    "Choisissez une route de longueur " + longueurRoute, // instruction
                    routesPossibles, // choix (pas des boutons, il faut cliquer sur la carte)
                    new ArrayList<>(), // boutons (ici aucun bouton créé)
                    true); // le joueur peut passer sans faire de choix
            if (choixRoute.equals("")) {
                // le joueur n'a pas fait de choix (cliqué sur le bouton "passer")
                log("Auncune route n'a été choisie");
            } else {
                // le joueur a choisi une route
                log("Vous avez choisi la route " + choixRoute);
            }
        }*/


    /**
     * Ajoute une carte dans la pile de défausse.
     * Dans le cas peu probable, où il y a moins de 5 cartes wagon face visibles
     * (parce que la pioche
     * et la défausse sont vides), alors il faut immédiatement rendre cette carte
     * face visible.
     *
     * @param c carte à défausser
     */
    public void defausserCarteWagon(CouleurWagon c) {
        //s'il y a moins de 5 cartes wagon face visibles (parce que la pioche
        //et la défausse sont vides), alors il faut immédiatement rendre cette carte face visible.
        if(cartesWagonVisibles.size()<5){
            cartesWagonVisibles.add(c);
            // sinon ajoute une carte dans la pile de défausse.
        } else defausseCartesWagon.add(c);
    }

    public boolean verifierCouleursDefausseesGare(List<CouleurWagon> liste){
        List<CouleurWagon> listeATester = new ArrayList<>();
        listeATester.addAll(liste);
        // s'il y a des LOCOMOTIVE on les enlève
        listeATester.removeIf(couleur -> couleur.equals(CouleurWagon.LOCOMOTIVE));
        // on vérifie que les cartes restantes sont de la même couleur
        for(CouleurWagon couleur : listeATester){
            if (!couleur.equals(listeATester.get(0))) {
                //log("Les couleurs choisies ne sont pas égales.");
                return false;
            }
        }
        return true;
    }

    /**
     * Pioche une carte de la pile de pioche
     * Si la pile est vide, les cartes de la défausse sont replacées dans la pioche
     * puis mélangées avant de piocher une carte
     *
     * @return la carte qui a été piochée (ou null si aucune carte disponible)
     */
    public CouleurWagon piocherCarteWagon() {
        CouleurWagon cartePiocher=null;
        if(pileCartesWagon.isEmpty() && !defausseCartesWagon.isEmpty()) {
            Collections.shuffle(defausseCartesWagon);
            pileCartesWagon.addAll(defausseCartesWagon);
            defausseCartesWagon.removeAll(defausseCartesWagon);
        }
        if(!pileCartesWagon.isEmpty()){
            cartePiocher=pileCartesWagon.get(0);
            pileCartesWagon.remove(0);
        }
        /*if(pileCartesWagon.isEmpty() && !defausseCartesWagon.isEmpty()) {
            Collections.shuffle(defausseCartesWagon);
            pileCartesWagon.addAll(defausseCartesWagon);
            defausseCartesWagon.removeAll(defausseCartesWagon);
        }*/
        return cartePiocher;
    }

    /**
     * Retire une carte wagon de la pile des cartes wagon visibles.
     * Si une carte a été retirée, la pile de cartes wagons visibles est recomplétée
     * (remise à 5, éventuellement remélangée si 3 locomotives visibles)
     */
    public void retirerCarteWagonVisible(CouleurWagon c) {
        //retire une carte Visble et recomplète la pile de wagons lisibles
        cartesWagonVisibles.remove(c);
        if(!pileCartesWagon.isEmpty()) cartesWagonVisibles.add(piocherCarteWagon());

        /*tant que nb joker>=3, on défausse les 5 cartes visibles et repioche 5 cartes visibles,*/
        //int nbChangement=0;
        int nbNonLoco=0;
        for(CouleurWagon cwVisible :cartesWagonVisibles){
            if(!cwVisible.equals(CouleurWagon.LOCOMOTIVE)) nbNonLoco++;
        }
        for (CouleurWagon cwGris : pileCartesWagon){
            if(!cwGris.equals(CouleurWagon.LOCOMOTIVE)) nbNonLoco++;
        }
        for(CouleurWagon cwDefausse : defausseCartesWagon){
            if(!cwDefausse.equals(CouleurWagon.LOCOMOTIVE)) nbNonLoco++;
        }
        if(nbNonLoco<3) return;
        while (!locomotiveVisibleInferieurTrois(cartesWagonVisibles)){
            //changerAllCarteWagonVisible();
            //nbChangement++;
            //if(nbChangement==3) return;
            changerAllCarteWagonVisible();
        }
    }

    /** méthode de superEquipe pour tester s'il y a plus de trois jokers parmi les cartes wagon visibles
     * @param liste : cartesWagonVisibles
     * @return : true si nb joker inférieur à trois
     */
    public boolean locomotiveVisibleInferieurTrois(List<CouleurWagon> liste){
        int nbLocomotive=0;
        for(CouleurWagon carte : liste) {
            if (carte.equals(CouleurWagon.LOCOMOTIVE)) {
                nbLocomotive++;
                if (nbLocomotive >= 3) return false;
            }
        }
        return true;
    }

    /**
     * méthode de superEquipe pour défausser tous les cartes Wagon visible
     * en cas de plus de 3 jokers parmi les cartes wagons visibles
    **/
    public void changerAllCarteWagonVisible() {
            defausseCartesWagon.addAll(cartesWagonVisibles);
            cartesWagonVisibles.removeAll(cartesWagonVisibles);
            for (int i = 0; i < 5; i++) {
                if(!defausseCartesWagon.isEmpty()||!pileCartesWagon.isEmpty())
                cartesWagonVisibles.add(piocherCarteWagon());
            }
        }

    /**
     * Pioche et renvoie la destination du dessus de la pile de destinations.
     *
     * @return la destination qui a été piochée (ou `null` si aucune destination
     *         disponible)
     */
    public Destination piocherDestination() {
        Destination destinationPioche=null;
        //s'il reste des carte dans pileDestination, on pioche sinon on pioche NOTHING
        if(!pileDestinations.isEmpty()){
            destinationPioche=pileDestinations.get(0);
            pileDestinations.remove(destinationPioche);
        }
        return destinationPioche;
    }

    public Route getRouteByNom(String nom){
        for(Route r : routes){
            if (r.getNom().equals(nom)){
                return r;
            }
        }
        return null;
    }

    public List<Joueur> getJoueurs() {
        return joueurs;
    }

    public List<CouleurWagon> getDefausseCartesWagon() {
        return defausseCartesWagon;
    }

    @Override
    public String toString() {
        StringJoiner joiner = new StringJoiner("\n");
        for (Joueur j : joueurs) {
            joiner.add(j.toString());
        }
        return joiner.toString();
    }

    /**
     * Ajoute un message au log du jeu
     */
    public void log(String message) {
        log.add(message);
    }

    /**
     * Ajoute un message à la file d'entrées
     */
    public void addInput(String message) {
        inputQueue.add(message);
    }

    /**
     * Lit une ligne de l'entrée standard
     * C'est cette méthode qui doit être appelée à chaque fois qu'on veut lire
     * l'entrée clavier de l'utilisateur (par exemple dans {@code Player.choisir})
     *
     * @return une chaîne de caractères correspondant à l'entrée suivante dans la
     *         file
     */
    public String lireLigne() {
        try {
            return inputQueue.take();
        } catch (InterruptedException e) {
            e.printStackTrace();
            return null;
        }
    }

    //Methode rajouter à la pile destination
    public void ajouterDansPileDestination(Destination d){
        pileDestinations.add(d);
    }

    public List<Destination> getPileDestinations() {
        return pileDestinations;
    }

    /**
     * Envoie l'état de la partie pour affichage aux joueurs avant de faire un choix
     *
     * @param instruction l'instruction qui est donnée au joueur
     * @param boutons     labels des choix proposés s'il y en a
     * @param peutPasser  indique si le joueur peut passer sans faire de choix
     */
    public void prompt(String instruction, Collection<String> boutons, boolean peutPasser) {
        System.out.println();
        System.out.println(this);
        if (boutons.isEmpty()) {
            System.out.printf(">>> %s: %s <<<%n", joueurCourant.getNom(), instruction);
        } else {
            StringJoiner joiner = new StringJoiner(" / ");
            for (String bouton : boutons) {
                joiner.add(bouton);
            }
            System.out.printf(">>> %s: %s [%s] <<<%n", joueurCourant.getNom(), instruction, joiner);
        }

        Map<String, Object> data = Map.ofEntries(
                new AbstractMap.SimpleEntry<String, Object>("prompt", Map.ofEntries(
                        new AbstractMap.SimpleEntry<String, Object>("instruction", instruction),
                        new AbstractMap.SimpleEntry<String, Object>("boutons", boutons),
                        new AbstractMap.SimpleEntry<String, Object>("nomJoueurCourant", getJoueurCourant().getNom()),
                        new AbstractMap.SimpleEntry<String, Object>("peutPasser", peutPasser))),
                new AbstractMap.SimpleEntry<>("villes",
                        villes.stream().map(Ville::asPOJO).collect(Collectors.toList())),
                new AbstractMap.SimpleEntry<>("routes",
                        routes.stream().map(Route::asPOJO).collect(Collectors.toList())),
                new AbstractMap.SimpleEntry<String, Object>("joueurs",
                        joueurs.stream().map(Joueur::asPOJO).collect(Collectors.toList())),
                new AbstractMap.SimpleEntry<String, Object>("piles", Map.ofEntries(
                        new AbstractMap.SimpleEntry<String, Object>("pileCartesWagon", pileCartesWagon.size()),
                        new AbstractMap.SimpleEntry<String, Object>("pileDestinations", pileDestinations.size()),
                        new AbstractMap.SimpleEntry<String, Object>("defausseCartesWagon", defausseCartesWagon),
                        new AbstractMap.SimpleEntry<String, Object>("cartesWagonVisibles", cartesWagonVisibles))),
                new AbstractMap.SimpleEntry<String, Object>("log", log));
        GameServer.setEtatJeu(new Gson().toJson(data));
    }
}
