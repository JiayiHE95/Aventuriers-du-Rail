package fr.umontpellier.iut.rails;

import java.util.ArrayList;
import java.util.HashMap;

public class Destination {
    /**
     * Ville de départ
     */
    private String ville1;
    /**
     * Ville d'arrivée
     */
    private String ville2;
    /**
     * Nombre de points que vaut la destination
     */
    private int valeur;

    public Destination(String ville1, String ville2, int valeur) {
        this.ville1 = ville1;
        this.ville2 = ville2;
        this.valeur = valeur;
    }

    @Override
    public String toString() {
        return getNom();
    }

    public String getNom() {
        return String.format("%s - %s (%d)", ville1, ville2, valeur);
    }

    public Object asPOJO() {
        HashMap<String, Object> data = new HashMap<>();
        data.put("ville1", ville1);
        data.put("ville2", ville2);
        data.put("valeur", valeur);
        return data;
    }

    /**
     * @return une liste contenant toutes les destinations "normales" du jeu
     */
    public static ArrayList<Destination> makeDestinationsEurope() {
        ArrayList<Destination> destinations = new ArrayList<>();
        destinations.add(new Destination("Athina", "Angora", 5));
        destinations.add(new Destination("Budapest", "Sofia", 5));
        destinations.add(new Destination("Frankfurt", "Kobenhavn", 5));
        destinations.add(new Destination("Rostov", "Erzurum", 5));
        destinations.add(new Destination("Sofia", "Smyrna", 5));
        destinations.add(new Destination("Kyiv", "Petrograd", 6));
        destinations.add(new Destination("Zurich", "Brindisi", 6));
        destinations.add(new Destination("Zurich", "Budapest", 6));
        destinations.add(new Destination("Warszawa", "Smolensk", 6));
        destinations.add(new Destination("Zagrab", "Brindisi", 6));
        destinations.add(new Destination("Paris", "Zagreb", 7));
        destinations.add(new Destination("Brest", "Marseille", 7));
        destinations.add(new Destination("London", "Berlin", 7));
        destinations.add(new Destination("Edinburgh", "Paris", 7));
        destinations.add(new Destination("Amsterdam", "Pamplona", 7));
        destinations.add(new Destination("Roma", "Smyrna", 8));
        destinations.add(new Destination("Palermo", "Constantinople", 8));
        destinations.add(new Destination("Sarajevo", "Sevastopol", 8));
        destinations.add(new Destination("Madrid", "Dieppe", 8));
        destinations.add(new Destination("Barcelona", "Bruxelles", 8));
        destinations.add(new Destination("Paris", "Wien", 8));
        destinations.add(new Destination("Barcelona", "Munchen", 8));
        destinations.add(new Destination("Brest", "Venezia", 8));
        destinations.add(new Destination("Smolensk", "Rostov", 8));
        destinations.add(new Destination("Marseille", "Essen", 8));
        destinations.add(new Destination("Kyiv", "Sochi", 8));
        destinations.add(new Destination("Madrid", "Zurich", 8));
        destinations.add(new Destination("Berlin", "Bucuresti", 8));
        destinations.add(new Destination("Bruxelles", "Danzic", 9));
        destinations.add(new Destination("Berlin", "Roma", 9));
        destinations.add(new Destination("Angora", "Kharkov", 10));
        destinations.add(new Destination("Riga", "Bucuresti", 10));
        destinations.add(new Destination("Essen", "Kyiv", 10));
        destinations.add(new Destination("Venizia", "Constantinople", 10));
        destinations.add(new Destination("London", "Wien", 10));
        destinations.add(new Destination("Athina", "Wilno", 11));
        destinations.add(new Destination("Stockholm", "Wien", 11));
        destinations.add(new Destination("Berlin", "Moskva", 12));
        destinations.add(new Destination("Amsterdam", "Wilno", 12));
        destinations.add(new Destination("Frankfurt", "Smolensk", 13));
        return destinations;
    }

    /**
     * @return une liste contenant toutes les destinations "longues" du jeu
     */
    public static ArrayList<Destination> makeDestinationsLonguesEurope() {
        ArrayList<Destination> destinations = new ArrayList<>();
        destinations.add(new Destination("Lisboa", "Danzic", 20));
        destinations.add(new Destination("Brest", "Petrograd", 20));
        destinations.add(new Destination("Palermo", "Moskva", 20));
        destinations.add(new Destination("Kobenhavn", "Erzurum", 21));
        destinations.add(new Destination("Edinburgh", "Athina", 21));
        destinations.add(new Destination("Cadiz", "Stockholm", 21));
        return destinations;
    }
}
