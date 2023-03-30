package fr.umontpellier.iut.rails;

import java.util.*;
import java.util.stream.Collectors;

public class Joueur {

    /**
     * Les couleurs possibles pour les joueurs (pour l'interface graphique)
     */
    public static enum Couleur {
        JAUNE, ROUGE, BLEU, VERT, ROSE;
    }

    /**
     * Jeu auquel le joueur est rattaché
     */
    private Jeu jeu;
    /**
     * Nom du joueur
     */
    private String nom;
    /**
     * CouleurWagon du joueur (pour représentation sur le plateau)
     */
    private Couleur couleur;
    /**
     * Nombre de gares que le joueur peut encore poser sur le plateau
     */
    private int nbGares;
    /**
     * Nombre de wagons que le joueur peut encore poser sur le plateau
     */
    private int nbWagons;
    /**
     * Liste des missions à réaliser pendant la partie
     */
    private List<Destination> destinations;
    /**
     * Liste des cartes que le joueur a en main
     */
    private List<CouleurWagon> cartesWagon;
    /**
     * Liste temporaire de cartes wagon que le joueur est en train de jouer pour
     * payer la capture d'une route ou la construction d'une gare
     */
    private List<CouleurWagon> cartesWagonPosees;
    /**
     * Score courant du joueur (somme des valeurs des routes capturées)
     */
    private int score;

    public Joueur(String nom, Jeu jeu, Joueur.Couleur couleur) {
        this.nom = nom;
        this.jeu = jeu;
        this.couleur = couleur;
        nbGares = 3;
        nbWagons = 45;
        cartesWagon = new ArrayList<>();
        cartesWagonPosees = new ArrayList<>();
        destinations = new ArrayList<>();
        score = 12; // chaque gare non utilisée vaut 4 points
    }

    public String getNom() {
        return nom;
    }

    public Couleur getCouleur() {
        return couleur;
    }

    public int getNbWagons() {
        return nbWagons;
    }

    public Jeu getJeu() {
        return jeu;
    }

    public List<CouleurWagon> getCartesWagonPosees() {
        return cartesWagonPosees;
    }

    public List<CouleurWagon> getCartesWagon() {
        return cartesWagon;
    }

    public List<Destination> getDestinations() {
        return destinations;
    }

    public int getScore() {
        return score;
    }

    /**
     * Attend une entrée de la part du joueur (au clavier ou sur la websocket) et
     * renvoie le choix du joueur.
     * <p>
     * Cette méthode lit les entrées du jeu ({@code Jeu.lireligne()}) jusqu'à ce
     * qu'un choix valide (un élément de {@code choix} ou de {@code boutons} ou
     * éventuellement la chaîne vide si l'utilisateur est autorisé à passer) soit
     * reçu.
     * Lorsqu'un choix valide est obtenu, il est renvoyé par la fonction.
     * <p>
     * Si l'ensemble des choix valides ({@code choix} + {@code boutons}) ne comporte
     * qu'un seul élément et que {@code canPass} est faux, l'unique choix valide est
     * automatiquement renvoyé sans lire l'entrée de l'utilisateur.
     * <p>
     * Si l'ensemble des choix est vide, la chaîne vide ("") est automatiquement
     * renvoyée par la méthode (indépendamment de la valeur de {@code canPass}).
     * <p>
     * Exemple d'utilisation pour demander à un joueur de répondre à une question
     * par "oui" ou "non" :
     * <p>
     * {@code
     * List<String> choix = Arrays.asList("Oui", "Non");
     * String input = choisir("Voulez vous faire ceci ?", choix, new ArrayList<>(), false);
     * }
     * <p>
     * <p>
     * Si par contre on voulait proposer les réponses à l'aide de boutons, on
     * pourrait utiliser :
     * <p>
     * {@code
     * List<String> boutons = Arrays.asList("1", "2", "3");
     * String input = choisir("Choisissez un nombre.", new ArrayList<>(), boutons, false);
     * }
     *
     * @param instruction message à afficher à l'écran pour indiquer au joueur la
     *                    nature du choix qui est attendu
     *
     * @param choix       une collection de chaînes de caractères correspondant aux
     *                    choix valides attendus du joueur
     *
     * @param boutons     une collection de chaînes de caractères correspondant aux
     *                    choix valides attendus du joueur qui doivent être
     *                    représentés par des boutons sur l'interface graphique.
     *
     * @param peutPasser  booléen indiquant si le joueur a le droit de passer sans
     *                    faire de choix. S'il est autorisé à passer, c'est la
     *                    chaîne de caractères vide ("") qui signifie qu'il désire
     *                    passer.
     * @return le choix de l'utilisateur (un élément de {@code choix}, ou de
     * {@code boutons} ou la chaîne vide)
     */
    public String choisir(String instruction, Collection<String> choix, Collection<String> boutons,
                          boolean peutPasser) {
        // on retire les doublons de la liste des choix
        HashSet<String> choixDistincts = new HashSet<>();
        choixDistincts.addAll(choix);
        choixDistincts.addAll(boutons);

        // Aucun choix disponible
        if (choixDistincts.isEmpty()) {
            return "";
        } else {
            // Un seul choix possible (renvoyer cet unique élément)
            if (choixDistincts.size() == 1 && !peutPasser)
                return choixDistincts.iterator().next();
            else {
                String entree;
                // Lit l'entrée de l'utilisateur jusqu'à obtenir un choix valide
                while (true) {
                    jeu.prompt(instruction, boutons, peutPasser);
                    entree = jeu.lireLigne();
                    // si une réponse valide est obtenue, elle est renvoyée
                    if (choixDistincts.contains(entree) || (peutPasser && entree.equals("")))
                        return entree;
                }
            }
        }
    }

    /**
     * Affiche un message dans le log du jeu (visible sur l'interface graphique)
     *
     * @param message le message à afficher (peut contenir des balises html pour la
     *                mise en forme)
     */
    public void log(String message) {
        jeu.log(message);
    }

    @Override
    public String toString() {
        StringJoiner joiner = new StringJoiner("\n");
        joiner.add(String.format("=== %s (%d pts) ===", nom, score));
        joiner.add(String.format("  Gares: %d, Wagons: %d", nbGares, nbWagons));
        joiner.add("  Destinations: "
                + destinations.stream().map(Destination::toString).collect(Collectors.joining(", ")));
        joiner.add("  Cartes wagon: " + CouleurWagon.listToString(cartesWagon));
        return joiner.toString();
    }

    /**
     * @return une chaîne de caractères contenant le nom du joueur, avec des balises
     * HTML pour être mis en forme dans le log
     */
    public String toLog() {
        return String.format("<span class=\"joueur\">%s</span>", nom);
    }

    /**
     * Renvoie une représentation du joueur sous la forme d'un objet Java simple
     * (POJO)
     */
    public Object asPOJO() {
        HashMap<String, Object> data = new HashMap<>();
        data.put("nom", nom);
        data.put("couleur", couleur);
        data.put("score", score);
        data.put("nbGares", nbGares);
        data.put("nbWagons", nbWagons);
        data.put("estJoueurCourant", this == jeu.getJoueurCourant());
        data.put("destinations", destinations.stream().map(Destination::asPOJO).collect(Collectors.toList()));
        data.put("cartesWagon", cartesWagon.stream().sorted().map(CouleurWagon::name).collect(Collectors.toList()));
        data.put("cartesWagonPosees",
                cartesWagonPosees.stream().sorted().map(CouleurWagon::name).collect(Collectors.toList()));
        return data;
    }

    public int getNbGares() {
        return nbGares;
    }

    public void setScore(int score) {this.score = score;}

    /**
     * Propose une liste de cartes destinations, parmi lesquelles le joueur doit en
     * garder un nombre minimum n.
     * <p>
     * Tant que le nombre de destinations proposées est strictement supérieur à n,
     * le joueur peut choisir une des destinations qu'il retire de la liste des
     * choix, ou passer (en renvoyant la chaîne de caractères vide).
     * <p>
     * Les destinations qui ne sont pas écartées sont ajoutées à la liste des
     * destinations du joueur. Les destinations écartées sont renvoyées par la
     * fonction.
     *
     * @param destinationsPossibles liste de destinations proposées parmi lesquelles
     *                              le joueur peut choisir d'en écarter certaines
     *
     * @param n                     nombre minimum de destinations que le joueur
     *                              doit garder
     *
     * @return liste des destinations qui n'ont pas été gardées par le joueur
     */
    public List<Destination> choisirDestinations(List<Destination> destinationsPossibles, int n) {
        ArrayList<Destination> destinationsJete = new ArrayList<>();
        ArrayList<Destination> destinationsJoueur = new ArrayList<>();
        ArrayList<String> choix = new ArrayList<>();
        ArrayList<String> boutons = new ArrayList<>();

        for (Destination d : destinationsPossibles  ){
            choix.add(d.getNom());
            boutons.add(d.getNom());
        }

        for(Destination d : destinationsPossibles){
            destinationsJoueur.add(d);
        }

        //Dans choisir soit on utilise des boutons ou des choix
        //cc

        while(destinationsJoueur.size() > n) {
            String laCarteADefausser = choisir("Choisir les destinations à defausser (max 2)", choix,boutons, true);

            if (laCarteADefausser.equals("")) { //si le string est vide alors on passe donc return liste vide
                for (Destination d: destinationsJoueur){
                    destinations.add(d);
                    log("Vous avez gardé la destination "+d.getNom());
                }
                return destinationsJete;
            }

            for (Destination d : destinationsPossibles) {
                if (laCarteADefausser.equals(d.getNom())) {
                    destinationsJete.add(d);
                    destinationsJoueur.remove(d);
                    //netoyer les boutons
                    boutons.remove(d.getNom());
                    choix.remove(d.getNom());
                    log("Vous avez abandonné la destination "+d.getNom());
                }
            }
        }
        for (Destination d: destinationsJoueur){
            destinations.add(d);
            log("Vous avez gardé la destination "+d.getNom());
        }

        return destinationsJete;
    }

    /**
     * Exécute un tour de jeu du joueur.
     * <p>
     * Cette méthode attend que le joueur choisisse une des options suivantes :
     *
     * - le nom d'une carte wagon face visible à prendre ;
     *
     * - le nom "GRIS" pour piocher une carte wagon face cachée s'il reste des
     * cartes à piocher dans la pile de pioche ou dans la pile de défausse ;
     *
     * - la chaîne "destinations" pour piocher des cartes destination ;
     *
     * - le nom d'une ville sur laquelle il peut construire une gare (ville non
     * prise par un autre joueur, le joueur a encore des gares en réserve et assez
     * de cartes wagon pour construire la gare) ;
     *
     * - le nom d'une route que le joueur peut capturer (pas déjà capturée, assez de
     * wagons et assez de cartes wagon) ;
     *
     * - la chaîne de caractères vide pour passer son tour
     * <p>
     * Lorsqu'un choix valide est reçu, l'action est exécutée (il est possible que
     * l'action nécessite d'autres choix de la part de l'utilisateur, comme "choisir les cartes wagon à défausser pour capturer une route" ou
     * "construire une gare", "choisir les destinations à défausser", etc.)
     */
    public void jouerTour() {
        // liste d'éléments cliquables sur ce tour
        ArrayList<String> optionTourDeJeu = new ArrayList<>();

        // On remplit la liste avec :
        // les routes disponibles
        List<String> nomRoutesDisponibles = new ArrayList<>();
        for (Route route : jeu.getRoutes()){
            if(route.getProprietaire()==null) {
                nomRoutesDisponibles.add(route.getNom());
                optionTourDeJeu.add(route.getNom());
            }
        }
        // les villes disponibles
        ArrayList<String> listeVillesDispos = new ArrayList<>();
        // on remplit une liste de villes qui n'ont pas de propriétaire
        for (Ville ville : jeu.getVilles()){
            if (ville.getProprietaire() == null) {
                listeVillesDispos.add(ville.toString());
                optionTourDeJeu.add(ville.toString());
            }
        }
        // les cartes Wagon visibles + la pioche
        ArrayList<String> cartesWagonDisponibles=new ArrayList<>();
        if(!jeu.getPileCartesWagon().isEmpty()||!jeu.getDefausseCartesWagon().isEmpty()){
            cartesWagonDisponibles.add("GRIS");
            optionTourDeJeu.add("GRIS");
        }
        for(CouleurWagon wagon : jeu.getCartesWagonVisibles()){
            cartesWagonDisponibles.add(wagon.name());
            optionTourDeJeu.add(wagon.name());
        }
        // la pioche destination
        if(!jeu.getPileDestinations().isEmpty())
        optionTourDeJeu.add("destinations");

        // choix parmi la liste d'éléments cliquables sur ce tour
        String optionChoisie = this.choisir("Que voulez-vous faire ?", optionTourDeJeu, new ArrayList<>(), true);
        // On teste l'option choisie :
        // Capturer route ?
        if (nomRoutesDisponibles.contains(optionChoisie)) {
            choixRoute(optionChoisie);
        }
        // Ville cliquée ?
        if (listeVillesDispos.contains(optionChoisie)) {
            choixGare(optionChoisie);
        }
        // carte Wagon ?
        if (cartesWagonDisponibles.contains(optionChoisie))  {
            choixCartesWagon(optionChoisie);
        }
        // nouvelle Destination ?
        if (optionChoisie.equals("destinations"))  {
            choixDestinationSuplementaire();
        }
    }

    public void choixRoute(String routeChoisie) {
        Route route = jeu.getRouteByNom(routeChoisie);
        CouleurWagon couleurRoute = route.getCouleur();
        log("Route choisie : "+route.toLog());
        //on test si la route choisie par joueur est faisable
        if (cartesWagon.size()<route.getLongueur()||nbWagons< route.getLongueur()){
            log("Carte wagon ou wagon insuffisant");
            jouerTour();
            return;
        }
        if (couleurRoute.equals(CouleurWagon.GRIS)) {
            if (!route.testFaisabiliteGris(cartesWagon)) {
                log("Vous ne pouvez pas construire cette route");
                jouerTour();
                return;
            }
        } else {
            if (!route.testFaisabiliteCouleur(cartesWagon, couleurRoute)) {
                log("Vous ne pouvez pas construire cette route");
                jouerTour();
                return;
            }
        }
        //On sait que cette route est faisable donc on peut construire
        while (true){
            String wagon = choisir("Choisir une carte wagon à poser", CouleurWagon.listeWagonToString(cartesWagon), new ArrayList<>(), false);
            CouleurWagon wagonChoisi=CouleurWagon.valueOf(wagon);
            if (route.verifierCouleurWagonChoisie(wagonChoisi,cartesWagon,getCartesWagonPosees())) {
                if(route.seConstruire(wagonChoisi,this)) {
                    for(CouleurWagon c : cartesWagonPosees) jeu.defausserCarteWagon(c);
                    cartesWagonPosees.clear();
                    route.setProprietaire(this);
                    nbWagons-= route.getLongueur();
                    setScore(score + route.calculerPoints());
                    log("Vous êtes propiétaire de "+route.toLog());
                }
                return;
            }else log(wagonChoisi.toLog()+" n'est pas valide");
        }
    }

    public void choixGare(String optionChoisie){
        // le joueur a-t-il le droit de faire ce choix ?
        if(nbGares==0){
            log("Choix impossible ! Vous n'avez plus de gares...");
            jouerTour();
        }
        // nombre de cartes à défausser pour la gare
        int nbCartesADefausser = 4 - nbGares;
        // liste de couleurs défaussées
        List<CouleurWagon> listeCartesWagonPosees = new ArrayList<>();
        cartesWagonPosees = new ArrayList<>();

        // Défausser le nombre de cartes
        for(int i=0; i<nbCartesADefausser; i++){
            ArrayList<String> cartesWagonJoueur = new ArrayList<>();
            for(CouleurWagon couleurWagon : cartesWagon) cartesWagonJoueur.add(couleurWagon.name());
            String carteADefausser = choisir("Choisir carte à défausser.", cartesWagonJoueur, new ArrayList<>(), true);

            // carte ajoutée à la liste à défausser
            cartesWagonPosees.add(CouleurWagon.valueOf(carteADefausser));
            // carte supprimée (temporairement si erreur de choix) de la main du joueur
            cartesWagon.remove(CouleurWagon.valueOf(carteADefausser));
//            log(carteADefausser);
            log("vous avez posé "+CouleurWagon.valueOf(carteADefausser).toLog());
        }

        // si les cartes défaussées sont de la même couleur (+ locos)
        if(jeu.verifierCouleursDefausseesGare(cartesWagonPosees)){
            // on defausse les cartes
            for (CouleurWagon couleur : cartesWagonPosees) jeu.defausserCarteWagon(couleur);

            String choixVille = optionChoisie;
            // on attribue la ville choisie au joueur, qui devient son propriétaire
            for (Ville ville : jeu.getVilles()){
                if(ville.toString().equals(choixVille) && nbGares>0) {
                    ville.setProprietaire(this);
                    // on soustrait 4 points au score
                    score-=4;
                    // on décrémente le nombre de gares disponibles
                    nbGares--;
                    // clean cartes posées
                    cartesWagonPosees.clear();
                    log("Gare construite sur la ville de "+ville.toLog());
                }
            }
        } else {
            log("Couleurs défaussées non équivalentes");
            // on remet les cartes dans la main du joueur
            for (CouleurWagon couleur : cartesWagonPosees) {
                cartesWagon.add(couleur);
            }
            cartesWagonPosees.clear();
            jouerTour();
        }
    }

    public void choixCartesWagon(String optionChoisie){
        String choixUtilisateur = optionChoisie;
        //si joueur a pioché une locomotive, on l'ajoute dans sa main et il passe son tour
        if (choixUtilisateur.equals(CouleurWagon.LOCOMOTIVE.name())) {
            jeu.retirerCarteWagonVisible(CouleurWagon.valueOf(choixUtilisateur));
            cartesWagon.add(CouleurWagon.valueOf(choixUtilisateur));
            log("Vous avez pioché "+CouleurWagon.LOCOMOTIVE.toLog());
            return;
        }
        else {
            // sinon on ajoute la premiere carte au joueur
            if (choixUtilisateur.equals("GRIS")) {
                cartesWagon.add(jeu.piocherCarteWagon());
                log("Vous avez pioché "+CouleurWagon.GRIS.toLog());
            }
            else {
                jeu.retirerCarteWagonVisible(CouleurWagon.valueOf(choixUtilisateur));
                cartesWagon.add(CouleurWagon.valueOf(choixUtilisateur));
                log("Vous avez pioché "+CouleurWagon.valueOf(choixUtilisateur).toLog());
            }

            //créer une liste de choix avec toutes les wagons visibles + wagon caché
            ArrayList<String> choix=new ArrayList<>();
            if(!jeu.getPileCartesWagon().isEmpty()||!jeu.getDefausseCartesWagon().isEmpty())
                choix.add("GRIS");
            for(CouleurWagon wagon : jeu.getCartesWagonVisibles() ){
                choix.add(wagon.name());
            }

            while (true){
                //on récupère le choix de l'utilisateur
                choixUtilisateur = choisir("Quelle carte Wagon voulez-vous piocher ?",choix, new ArrayList<>(), true);

                //s'il a cliqué sur la pile wagon caché on lui pioche une carte wagon cachée
                if(choixUtilisateur.equals("GRIS")){
                    cartesWagon.add(jeu.piocherCarteWagon());
                    log("Vous avez pioché "+CouleurWagon.GRIS.toLog());
                    return;
                }

                //Si il veut rien piocher il passe son tour
                if(choixUtilisateur.equals("")) return;

                // choix loco interdit en deuxième carte
                if (choixUtilisateur.equals(CouleurWagon.LOCOMOTIVE.name())) {
                    log("Choix impossible en deuxième carte...");
                    continue;
                }

                else {
                    jeu.retirerCarteWagonVisible(CouleurWagon.valueOf(choixUtilisateur));
                    cartesWagon.add(CouleurWagon.valueOf(choixUtilisateur));
                    log("Vous avez pioché "+CouleurWagon.valueOf(choixUtilisateur).toLog());
                    return;
                }
            }
        }
    }

    public void choixDestinationSuplementaire() {
        ArrayList<Destination> listDestinationSuplementaires = new ArrayList();
        ArrayList<String> listDestinationSuplementaireString = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            if(!jeu.getPileDestinations().isEmpty())
            listDestinationSuplementaires.add(jeu.piocherDestination());
        }

        for (Destination d : listDestinationSuplementaires) {
            listDestinationSuplementaireString.add(d.getNom());
        }

        while (listDestinationSuplementaires.size() > 1) {
            String choix = choisir("Voulez-vous défausser certaines destinations ? (maximum 2)",
                    listDestinationSuplementaireString, listDestinationSuplementaireString, true);

            if (choix.equals("")) break;
            if (listDestinationSuplementaireString.contains(choix)) {
                int index = listDestinationSuplementaireString.indexOf(choix);
                Destination cp = listDestinationSuplementaires.get(index);

                jeu.getPileDestinations().add(cp);
                listDestinationSuplementaireString.remove(cp.getNom());
                listDestinationSuplementaires.remove(cp);
                log("Vous avez abandonné la destination "+cp.getNom());
            }
        }

        for (Destination d : listDestinationSuplementaires) {
            destinations.add(d);
            log("Vous avez gardé la destination "+d.getNom());
        }
    }

}
