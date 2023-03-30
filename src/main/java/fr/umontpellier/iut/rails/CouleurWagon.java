package fr.umontpellier.iut.rails;

import java.util.*;

/**
 * Représentation des couleurs du jeu utilisées pour les cartes wagon et les joueurs
 */
public enum CouleurWagon {
    NOIR, BLANC, JAUNE, ROUGE, ORANGE, BLEU, VERT, ROSE, GRIS, LOCOMOTIVE;

    @Override
    public String toString() {
        return switch (this) {
            case NOIR -> "Noir";
            case BLANC -> "Blanc";
            case JAUNE -> "Jaune";
            case ROUGE -> "Rouge";
            case ORANGE -> "Orange";
            case BLEU -> "Bleu";
            case VERT -> "Vert";
            case ROSE -> "Rose";
            case GRIS -> "Gris"; // représente une couleur indéterminée
            case LOCOMOTIVE -> "Locomotive"; // peut remplacer n'importe quelle couleur
        };
    }

    public String toLog() {
        return String.format("<img class=\"couleur\" src=\"images/symbole-%s.png\"><span class=\"couleur %s\">%s</span>", name(), name().toLowerCase(), this);
    }

    /**
     * Renvoie la liste des couleurs "simples" c'est-à-dire sans LOCOMOTIVE ni GRIS
     */
    public static ArrayList<CouleurWagon> getCouleursSimples() {
        return new ArrayList<>(List.of(NOIR, BLANC, JAUNE, ROUGE, ORANGE, BLEU, VERT, ROSE));
    }

    /**
     * Renvoie la représentation sous forme d'une chaîne de caractères d'une liste
     * non ordonnée de couleurs.
     * 
     * La chaîne est constituée du nom de chaque couleur qui apparaît dans la liste,
     * suivie éventuellement d'une chaîne de la forme " x n" où n est le nombre de
     * fois que la couleur apparaît dans la liste, si n > 1. Les couleurs sont
     * séparées par des virgules.
     * 
     * @param liste une liste de couleurs (considérée comme non ordonnée)
     * @return une chaîne de caractères décrivant les éléments qui apparaissent dans
     *         la liste
     */
    public static String listToString(List<CouleurWagon> liste) {
        StringJoiner joiner = new StringJoiner(", ");
        for (CouleurWagon c : CouleurWagon.values()) {
            int count = Collections.frequency(liste, c);
            if (count == 1) {
                joiner.add(c.toString());
            } else if (count > 1) {
                joiner.add(c.toString() + " x" + count);
            }
        }
        return joiner.toString();
    }

    public static String listToLog(List<CouleurWagon> liste) {
        StringJoiner joiner = new StringJoiner(", ");
        for (CouleurWagon c : CouleurWagon.values()) {
            int count = Collections.frequency(liste, c);
            if (count == 1) {
                joiner.add(c.toLog());
            } else if (count > 1) {
                joiner.add(c.toLog() + " x" + count);
            }
        }
        return joiner.toString();
    }


    public static ArrayList<String> listeWagonToString(List<CouleurWagon> listeWagon){
        ArrayList<String> wagonString=new ArrayList<>();
        for(CouleurWagon couleur : listeWagon) wagonString.add(couleur.name());
        return wagonString;
    }
    public int compteNbCouleur(List<CouleurWagon> liste){
        int nb=0;
        for(CouleurWagon c : liste){
            if(c.equals(this)) nb++;
        }
        return nb;
    }
}
