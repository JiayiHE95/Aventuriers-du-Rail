package fr.umontpellier.iut.rails;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class JeuProfTest {
    private IOJeu jeu;

    @BeforeEach
    public void setUp() {
        jeu = new IOJeu(new String[] { "Guybrush", "Largo", "LeChuck", "Elaine" });
    }

    @Test
    void testCartesWagon() {
        // regrouper toutes les cartes wagon du jeu
        List<CouleurWagon> cartes = new ArrayList<>();
        cartes.addAll(jeu.getPileCartesWagon());
        cartes.addAll(jeu.getCartesWagonVisibles());
        cartes.addAll(jeu.getDefausseCartesWagon());
        for (Joueur j : jeu.getJoueurs()) {
            cartes.addAll(j.getCartesWagon());
        }

        // compter le nombre de chaque couleur
        HashMap<CouleurWagon, Integer> compteur = new HashMap<>();
        for (CouleurWagon c : cartes) {
            if (compteur.containsKey(c)) {
                compteur.put(c, compteur.get(c) + 1);
            } else {
                compteur.put(c, 1);
            }
        }

        // varifier le nombre d'exemplaires de chaque couleur
        assertEquals(110, cartes.size());
        assertEquals(12, compteur.get(CouleurWagon.NOIR));
        assertEquals(12, compteur.get(CouleurWagon.BLANC));
        assertEquals(12, compteur.get(CouleurWagon.JAUNE));
        assertEquals(12, compteur.get(CouleurWagon.ROUGE));
        assertEquals(12, compteur.get(CouleurWagon.ORANGE));
        assertEquals(12, compteur.get(CouleurWagon.BLEU));
        assertEquals(12, compteur.get(CouleurWagon.VERT));
        assertEquals(12, compteur.get(CouleurWagon.ROSE));
        assertEquals(14, compteur.get(CouleurWagon.LOCOMOTIVE));
    }

    @Test
    void testInitialisationCartesVisibles() {
        // vérifie que les cartes wagon face visible sont bien distribuées dans le
        // constructeur du jeu
        assertEquals(5, jeu.getCartesWagonVisibles().size());
    }

    @Test
    void testDestinationsInitialesTousLesJoueursPassent() {
        jeu.setInput("", "", "", "");
        try {
            jeu.run();
        } catch (IndexOutOfBoundsException e) {
            // on vérifie que chaque joueur a 3 destinations normales et 1 destination
            // longue
            List<String> nomsDestinations = new ArrayList<>();
            for (Destination d : Destination.makeDestinationsEurope()) {
                nomsDestinations.add(d.getNom());
            }
            List<String> nomsDestinationsLongues = new ArrayList<>();
            for (Destination d : Destination.makeDestinationsLonguesEurope()) {
                nomsDestinationsLongues.add(d.getNom());
            }
            for (Joueur j : jeu.getJoueurs()) {
                int nbDestinations = 0;
                int nbDestinationsLongues = 0;
                for (Destination d : j.getDestinations()) {
                    if (nomsDestinations.contains(d.getNom())) {
                        nbDestinations += 1;
                    } else if (nomsDestinationsLongues.contains(d.getNom())) {
                        nbDestinationsLongues += 1;
                    }
                }
                assertEquals(3, nbDestinations);
                assertEquals(1, nbDestinationsLongues);
            }
        }
    }
}
