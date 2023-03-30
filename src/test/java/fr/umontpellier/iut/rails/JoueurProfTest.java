package fr.umontpellier.iut.rails;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class JoueurProfTest {
    private IOJeu jeu;
    private Joueur joueur1;
    private Joueur joueur2;
    private Joueur joueur3;
    private Joueur joueur4;

    /**
     * Renvoie la route du jeu dont le nom est passé en argument
     * 
     * @param nom le nom de la route
     * @return la route du jeu dont le nom est passé en argument (ou null si aucune
     *         route ne correspond)
     */
    public Route getRouteParNom(String nom) {
        for (Route route : jeu.getRoutes()) {
            if (route.getNom().equals(nom)) {
                return route;
            }
        }
        return null;
    }

    /**
     * Renvoie la ville du jeu dont le nom est passé en argument
     * 
     * @param nom le nom de la ville
     * @return la ville du jeu dont le nom est passé en argument (ou null si aucune
     *         ville ne correspond)
     */
    public Ville getVilleParNom(String nom) {
        for (Ville ville : jeu.getVilles()) {
            if (ville.getNom().equals(nom)) {
                return ville;
            }
        }
        return null;
    }

    @BeforeEach
    void init() {
        jeu = new IOJeu(new String[] { "Guybrush", "Largo", "LeChuck", "Elaine" });
        List<Joueur> joueurs = jeu.getJoueurs();
        joueur1 = joueurs.get(0);
        joueur2 = joueurs.get(1);
        joueur3 = joueurs.get(2);
        joueur4 = joueurs.get(3);
    }

    /**
     * Place 5 cartes ROUGE dans les cartes visibles, vide la pioche, la défausse et
     * les mains des joueurs
     */
    void clear() {
        List<CouleurWagon> cartesVisibles = jeu.getCartesWagonVisibles();
        cartesVisibles.clear();
        cartesVisibles.add(CouleurWagon.ROUGE);
        cartesVisibles.add(CouleurWagon.ROUGE);
        cartesVisibles.add(CouleurWagon.ROUGE);
        cartesVisibles.add(CouleurWagon.ROUGE);
        cartesVisibles.add(CouleurWagon.ROUGE);
        jeu.getPileCartesWagon().clear();
        jeu.getDefausseCartesWagon().clear();

        joueur1.getCartesWagon().clear();
        joueur2.getCartesWagon().clear();
        joueur3.getCartesWagon().clear();
        joueur4.getCartesWagon().clear();
    }

//    @Disabled
    @Test
    void testInitialisation() {
        for (Joueur joueur : jeu.getJoueurs()) {
            assertEquals(3, joueur.getNbGares());
            assertEquals(4, joueur.getCartesWagon().size());
            assertEquals(45, joueur.getNbWagons());
        }
    }

    @Test
    void testChoisirDestinations() {
        clear();

        jeu.setInput("Athina - Angora (5)", "Frankfurt - Kobenhavn (5)");
        ArrayList<Destination> destinationsPossibles = new ArrayList<>();
        Destination d1 = new Destination("Athina", "Angora", 5);
        Destination d2 = new Destination("Budapest", "Sofia", 5);
        Destination d3 = new Destination("Frankfurt", "Kobenhavn", 5);
        Destination d4 = new Destination("Rostov", "Erzurum", 5);
        destinationsPossibles.add(d1);
        destinationsPossibles.add(d2);
        destinationsPossibles.add(d3);
        destinationsPossibles.add(d4);

        List<Destination> destinationsDefaussees = joueur1.choisirDestinations(destinationsPossibles, 2);
        assertEquals(2, joueur1.getDestinations().size());
        assertEquals(2, destinationsDefaussees.size());
        assertTrue(destinationsDefaussees.contains(d1));
        assertTrue(destinationsDefaussees.contains(d3));
        assertTrue(joueur1.getDestinations().contains(d2));
        assertTrue(joueur1.getDestinations().contains(d4));
    }

//    @Disabled
    @Test
    void testJouerTourPrendreCartesWagon() {
        clear();

        List<CouleurWagon> cartesWagonVisibles = jeu.getCartesWagonVisibles();

        // On met VERT x3, BLEU, LOCOMOTIVE (haut de pile) dans la pile de cartes wagon
        List<CouleurWagon> pileCartesWagon = jeu.getPileCartesWagon();
        pileCartesWagon.add(0, CouleurWagon.VERT);
        pileCartesWagon.add(0, CouleurWagon.VERT);
        pileCartesWagon.add(0, CouleurWagon.VERT);
        pileCartesWagon.add(0, CouleurWagon.BLEU);
        pileCartesWagon.add(0, CouleurWagon.LOCOMOTIVE);

        jeu.setInput(
                "JAUNE", // non valide (il n'y a que du ROUGE dans les cartes visibles)
                "GRIS", // ok, pioche une LOCOMOTIVE sur le haut de la pile
                "ROUGE"); // ok, prend dans les cartes visibles (remplacée par BLEU)

        joueur1.jouerTour();
        // le joueur devrait piocher la LOCOMOTIVE, prendre une carte ROUGE
        // puis le jeu devrait remettre une carte visible BLEU

        assertTrue(TestUtils.contientExactement(
                joueur1.getCartesWagon(),
                CouleurWagon.ROUGE,
                CouleurWagon.LOCOMOTIVE));
        assertTrue(TestUtils.contientExactement(
                cartesWagonVisibles,
                CouleurWagon.BLEU,
                CouleurWagon.ROUGE,
                CouleurWagon.ROUGE,
                CouleurWagon.ROUGE,
                CouleurWagon.ROUGE));
        assertTrue(TestUtils.contientExactement(
                jeu.getPileCartesWagon(),
                CouleurWagon.VERT,
                CouleurWagon.VERT,
                CouleurWagon.VERT));
    }

//    @Disabled
    @Test
    void testJouerTourPiocherDestinations() {
        clear();

        Destination d1 = new Destination("Brest", "Marseille", 7);
        Destination d2 = new Destination("London", "Berlin", 7);
        Destination d3 = new Destination("Edinburgh", "Paris", 7);
        Destination d4 = new Destination("Amsterdam", "Pamplona", 7);
        Destination d5 = new Destination("Roma", "Smyrna", 8);

        // le joueur choisir de piocher des destinations, pioche les destinations d1,
        // d2, d3, choisit
        // de défausser d3 et passe (il garde donc d1 et d2)
        jeu.setInput("destinations", d3.getNom(), "");
        List<Destination> pileDestinations = jeu.getPileDestinations();
        pileDestinations.clear();
        pileDestinations.add(d1); // début de la liste : haut de la pile
        pileDestinations.add(d2);
        pileDestinations.add(d3);
        pileDestinations.add(d4);
        pileDestinations.add(d5); // fin de la liste : fond de la pile

        joueur1.jouerTour();
        assertEquals(d4, pileDestinations.get(0));
        assertEquals(d5, pileDestinations.get(1));
        assertEquals(d3, pileDestinations.get(2)); // d3 est remise en fond de pile
        assertEquals(2, joueur1.getDestinations().size());
        assertTrue(joueur1.getDestinations().contains(d1));
        assertTrue(joueur1.getDestinations().contains(d2));
    }

//    @Disabled
    @Test
    void testJouerTourCapturerRoute() {
        clear();

        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        jeu.setInput(
                "Brest - Pamplona", // coûte 4 ROSE (ne peut pas capturer)
                "Bruxelles - Frankfurt", // coûte 2 BLEU
                "BLEU", // ok
                "ROUGE", // ne convient pas pour une route de 2 BLEU
                "LOCOMOTIVE" // ok
        );

        joueur2.jouerTour();
        assertEquals(null, getRouteParNom("Brest - Pamplona").getProprietaire());
        assertEquals(joueur2, getRouteParNom("Bruxelles - Frankfurt").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur2.getCartesWagon(),
                CouleurWagon.BLEU, CouleurWagon.ROUGE, CouleurWagon.ROUGE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.BLEU,
                CouleurWagon.LOCOMOTIVE));
        assertEquals(14, joueur2.getScore());
    }

//    @Disabled
    @Test
    void testJouerTourCapturerRoutePlusieursCouleursPossibles() {
        clear();

        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.VERT);
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        jeu.setInput(
                "Marseille - Paris", // coûte 4 GRIS
                "VERT", // ne convient pas (impossible de payer en VERT)
                "LOCOMOTIVE", // ok
                "BLEU", // ok (paye tout le reste en BLEU ou LOCOMOTIVE)
                "ROUGE", // ne convient pas car déjà payé BLEU
                "BLEU", // ok
                "LOCOMOTIVE" // ok
        );

        joueur2.jouerTour();
        assertEquals(joueur2, getRouteParNom("Marseille - Paris").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur2.getCartesWagon(),
                CouleurWagon.VERT,
                CouleurWagon.BLEU,
                CouleurWagon.ROUGE, CouleurWagon.ROUGE, CouleurWagon.ROUGE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.BLEU,
                CouleurWagon.BLEU,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE));
        assertEquals(19, joueur2.getScore());
    }

//    @Disabled
    @Test
    void testJouerTourCapturerTunnelOK() {
        clear();

        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        // cartes qui seront piochées après avoir payé le prix initial du tunnel
        jeu.getPileCartesWagon().add(0, CouleurWagon.BLEU);
        jeu.getPileCartesWagon().add(0, CouleurWagon.ROSE);
        jeu.getPileCartesWagon().add(0, CouleurWagon.JAUNE);

        jeu.setInput(
                "Marseille - Zurich", // coûte 2 ROSE (tunnel)
                "ROSE", // ok
                "LOCOMOTIVE", // ok
                "ROSE" // coût supplémentaire du tunnel
        );

        joueur2.jouerTour();
        assertEquals(joueur2, getRouteParNom("Marseille - Zurich").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur2.getCartesWagon(),
                CouleurWagon.ROUGE, CouleurWagon.ROUGE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.ROSE,
                CouleurWagon.ROSE,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.BLEU,
                CouleurWagon.ROSE,
                CouleurWagon.JAUNE));
        assertEquals(14, joueur2.getScore());
    }

//    @Disabled
    @Test
    void testJouerTourCapturerTunnelImpossible() {
        clear();

        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        // cartes qui seront piochées après avoir payé le prix initial du tunnel
        jeu.getPileCartesWagon().add(0, CouleurWagon.ROSE);
        jeu.getPileCartesWagon().add(0, CouleurWagon.BLEU);
        jeu.getPileCartesWagon().add(0, CouleurWagon.JAUNE);

        jeu.setInput(
                "Marseille - Zurich", // coûte 2 ROSE (tunnel)
                "ROSE", // ok
                "LOCOMOTIVE" // ok, mais le joueur ne peut pas payer le coût supplémentaire
        );

        joueur2.jouerTour();
        assertEquals(null, getRouteParNom("Marseille - Zurich").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur2.getCartesWagon(),
                CouleurWagon.ROSE, CouleurWagon.ROUGE, CouleurWagon.ROUGE, CouleurWagon.LOCOMOTIVE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.ROSE,
                CouleurWagon.BLEU,
                CouleurWagon.JAUNE));
        assertEquals(12, joueur2.getScore());
    }

//    @Disabled
    @Test
    void testJouerTourCapturerTunnelAbandonne() {
        clear();

        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        // cartes qui seront piochées après avoir payé le prix initial du tunnel
        jeu.getPileCartesWagon().add(0, CouleurWagon.BLEU);
        jeu.getPileCartesWagon().add(0, CouleurWagon.JAUNE);
        jeu.getPileCartesWagon().add(0, CouleurWagon.ROSE);

        jeu.setInput(
                "Marseille - Zurich", // coûte 2 ROSE (tunnel)
                "ROSE", // ok
                "LOCOMOTIVE", // ok
                "" // le joueur pourrait payer mais choisit d'abandonner la capture
        );

        joueur2.jouerTour();
        assertEquals(null, getRouteParNom("Marseille - Zurich").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur2.getCartesWagon(),
                CouleurWagon.ROSE, CouleurWagon.ROSE, CouleurWagon.ROUGE, CouleurWagon.ROUGE,
                CouleurWagon.LOCOMOTIVE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.ROSE,
                CouleurWagon.BLEU,
                CouleurWagon.JAUNE));
        assertEquals(12, joueur2.getScore());
    }

//    @Disabled
    @Test
    void testJouerTourCapturerFerry() {
        clear();

        List<CouleurWagon> cartesWagon = joueur3.getCartesWagon();
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.JAUNE);
        cartesWagon.add(CouleurWagon.JAUNE);
        cartesWagon.add(CouleurWagon.JAUNE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        // Remarque:
        // Il est possible de faire en sorte que la locomotive imposée par le ferry soit
        // immédiatement payée par le joueur sans demander d'input (l'utilisateur doit
        // alors choisir les cartes restantes pour payer) ou bien de demander à
        // l'utilisateur de choisir toutes les cartes pour payer (y compris la
        // locomotive imposée). Le test devrait fonctionner dans les deux cas.
        jeu.setInput(
                "Constantinople - Sevastopol", // (ferry) coûte 4 GRIS dont 2 LOCOMOTIVE (ne peut pas acheter)
                "Palermo - Roma", // (ferry) coûte 4 GRIS dont 1 LOCOMOTIVE (peut acheter)
                "ROSE", // non valide (ne peut pas couvrir le coût)
                "JAUNE", // OK
                "JAUNE", // OK
                "JAUNE", // OK
                "LOCOMOTIVE" // OK
        );
        joueur3.jouerTour();

        assertEquals(joueur3, getRouteParNom("Palermo - Roma").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur3.getCartesWagon(),
                CouleurWagon.ROSE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.JAUNE, CouleurWagon.JAUNE, CouleurWagon.JAUNE,
                CouleurWagon.LOCOMOTIVE));
        assertEquals(null, getRouteParNom("Constantinople - Sevastopol").getProprietaire());
        assertEquals(19, joueur3.getScore());
    }

//    @Disabled
    @Test
    void testJouerTourConstruireUneGare() {
        clear();

        List<CouleurWagon> cartesWagon = joueur3.getCartesWagon();
        cartesWagon.add(CouleurWagon.VERT);
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);

        jeu.setInput("Paris", "ROUGE");
        joueur3.jouerTour();

        assertEquals(joueur3, getVilleParNom("Paris").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur3.getCartesWagon(),
                CouleurWagon.VERT, CouleurWagon.BLEU, CouleurWagon.BLEU, CouleurWagon.ROUGE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.ROUGE));
        assertEquals(2, joueur3.getNbGares());
    }

    // ______________________________TEST DU GROUPE_________________________________

    @Test
    void defausseDevenirPileCarteWagon(){
        jeu.getDefausseCartesWagon().add(CouleurWagon.ROUGE);
        jeu.getPileCartesWagon().clear();
        jeu.piocherCarteWagon();
        assertEquals(jeu.getDefausseCartesWagon().size(),0);
    }
    @Test
    void defausseDevenirCarteWagonVisible(){
        jeu.getCartesWagonVisibles().removeAll(jeu.getCartesWagonVisibles());
        jeu.getCartesWagonVisibles().add(CouleurWagon.ROUGE);
        jeu.defausserCarteWagon(CouleurWagon.BLANC);
        assertTrue(TestUtils.contientExactement(
                jeu.getCartesWagonVisibles(),
                CouleurWagon.ROUGE,
                CouleurWagon.BLANC));
    }

    @Test
    void testCapturerRouteCouleur() {
        clear();
        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        jeu.setInput(
                "Bruxelles - Frankfurt", // coûte 2 BLEU
                "LOCOMOTIVE", // ok
                "ROUGE", // ne convient pas pour une route de 2 BLEU
                "BLEU" // ok

        );

        joueur2.jouerTour();
        assertEquals(joueur2, getRouteParNom("Bruxelles - Frankfurt").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur2.getCartesWagon(),
                CouleurWagon.BLEU, CouleurWagon.ROUGE, CouleurWagon.ROUGE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.BLEU,
                CouleurWagon.LOCOMOTIVE));
    }

    @Test
    void testJouerTourConstruireRouteGrisAvecLoco() {
        clear();
        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.BLEU);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        jeu.setInput(
                "Bruxelles - Frankfurt", // coûte 2 BLEU
                "LOCOMOTIVE",
                "LOCOMOTIVE"
        );

        joueur2.jouerTour();
        assertEquals(joueur2, getRouteParNom("Bruxelles - Frankfurt").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur2.getCartesWagon(),
                CouleurWagon.BLEU, CouleurWagon.ROUGE, CouleurWagon.ROUGE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE));
    }

    @Test
    void testCapturerTunnelpossible() {
        clear();
        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        // cartes qui seront piochées après avoir payé le prix initial du tunnel
        jeu.getPileCartesWagon().add(0, CouleurWagon.LOCOMOTIVE);
        jeu.getPileCartesWagon().add(0, CouleurWagon.ROSE);
        jeu.getPileCartesWagon().add(0, CouleurWagon.JAUNE);

        jeu.setInput(
                "Marseille - Zurich", // coûte 2 ROSE (tunnel)
                "LOCOMOTIVE", // ok
                "LOCOMOTIVE", // ok
                "LOCOMOTIVE"// ok
        );

        joueur2.jouerTour();
        assertEquals(joueur2, getRouteParNom("Marseille - Zurich").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.ROSE,
                CouleurWagon.JAUNE));
    }


    @Test
    void testCapturerTunnel() {
        clear();
        List<CouleurWagon> cartesWagon = joueur2.getCartesWagon();
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.ROUGE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        // cartes qui seront piochées après avoir payé le prix initial du tunnel
        jeu.getPileCartesWagon().add(0, CouleurWagon.BLEU);
        jeu.getPileCartesWagon().add(0, CouleurWagon.ROSE);
        jeu.getPileCartesWagon().add(0, CouleurWagon.JAUNE);

        jeu.setInput(
                "Marseille - Zurich", // coûte 2 ROSE (tunnel)
                "ROSE", // ok
                "LOCOMOTIVE", // ok
                "ROUGE", //passe pas
                "ROSE"// coût supplémentaire du tunnel
        );

        joueur2.jouerTour();
        assertEquals(joueur2, getRouteParNom("Marseille - Zurich").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur2.getCartesWagon(),
                CouleurWagon.ROUGE, CouleurWagon.ROUGE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.ROSE,
                CouleurWagon.ROSE,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.BLEU,
                CouleurWagon.ROSE,
                CouleurWagon.JAUNE));
    }

    @Test
    void testJouerTourCapturerFerry2() {
        clear();

        List<CouleurWagon> cartesWagon = joueur3.getCartesWagon();
        cartesWagon.add(CouleurWagon.ROSE);
        cartesWagon.add(CouleurWagon.JAUNE);
        cartesWagon.add(CouleurWagon.JAUNE);
        cartesWagon.add(CouleurWagon.JAUNE);
        cartesWagon.add(CouleurWagon.JAUNE);
        cartesWagon.add(CouleurWagon.LOCOMOTIVE);

        // Remarque:
        // Il est possible de faire en sorte que la locomotive imposée par le ferry soit
        // immédiatement payée par le joueur sans demander d'input (l'utilisateur doit
        // alors choisir les cartes restantes pour payer) ou bien de demander à
        // l'utilisateur de choisir toutes les cartes pour payer (y compris la
        // locomotive imposée). Le test devrait fonctionner dans les deux cas.
        jeu.setInput(
                "Constantinople - Sevastopol", // (ferry) coûte 4 GRIS dont 2 LOCOMOTIVE (ne peut pas acheter)
                "Palermo - Roma", // (ferry) coûte 4 GRIS dont 1 LOCOMOTIVE (peut acheter)
                "ROSE", // non valide (ne peut pas couvrir le coût)
                "JAUNE", // OK
                "JAUNE", // OK
                "JAUNE",// OK
                "JAUNE",
                "LOCOMOTIVE" // OK
        );
        joueur3.jouerTour();

        assertEquals(joueur3, getRouteParNom("Palermo - Roma").getProprietaire());
        assertTrue(TestUtils.contientExactement(
                joueur3.getCartesWagon(),
                CouleurWagon.ROSE,CouleurWagon.JAUNE));
        assertTrue(TestUtils.contientExactement(
                jeu.getDefausseCartesWagon(),
                CouleurWagon.JAUNE, CouleurWagon.JAUNE, CouleurWagon.JAUNE,
                CouleurWagon.LOCOMOTIVE));
        assertEquals(null, getRouteParNom("Constantinople - Sevastopol").getProprietaire());
        assertEquals(19, joueur3.getScore());
    }

    @Test
    void testJouerTourPrendreCartesWagon2() {
        clear();
        List<CouleurWagon> cartesWagonVisibles = jeu.getCartesWagonVisibles();

        // On met VERT x3, BLEU, LOCOMOTIVE (haut de pile) dans la pile de cartes wagon
        cartesWagonVisibles.clear();
        cartesWagonVisibles.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonVisibles.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonVisibles.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonVisibles.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonVisibles.add(CouleurWagon.VERT);
        jeu.setInput(
                "VERT",
                ""
                ); // ok, prend dans les cartes visibles (remplacée par BLEU)

        joueur1.jouerTour();
        // le joueur devrait piocher la LOCOMOTIVE, prendre une carte ROUGE
        // puis le jeu devrait remettre une carte visible BLEU

        assertTrue(TestUtils.contientExactement(
                joueur1.getCartesWagon(),
                CouleurWagon.VERT));
        assertTrue(TestUtils.contientExactement(
                cartesWagonVisibles,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE));
    }

    @Test
    void testChangerCarteWagonVisibleLocomotiveSuperieurA3() {
        clear();
        List<CouleurWagon> cartesWagonVisibles = jeu.getCartesWagonVisibles();
        List<CouleurWagon> cartesWagonPile=jeu.getPileCartesWagon();
        cartesWagonVisibles.clear();
        cartesWagonVisibles.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonVisibles.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonVisibles.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonVisibles.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonVisibles.add(CouleurWagon.VERT);
        cartesWagonPile.clear();
        cartesWagonPile.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonPile.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonPile.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonPile.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonPile.add(CouleurWagon.LOCOMOTIVE);
        cartesWagonPile.add(CouleurWagon.VERT);
        cartesWagonPile.add(CouleurWagon.VERT);
        jeu.setInput(
                "LOCOMOTIVE"
        );

        joueur1.jouerTour();

        assertTrue(TestUtils.contientExactement(
                joueur1.getCartesWagon(),
                CouleurWagon.LOCOMOTIVE));
        assertTrue(TestUtils.contientExactement(
                cartesWagonVisibles,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.LOCOMOTIVE,
                CouleurWagon.VERT,
                CouleurWagon.VERT,
                CouleurWagon.VERT));
    }



}
