package fr.umontpellier.iut.rails;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class Route {
    /**
     * Première extrémité
     */
    private Ville ville1;
    /**
     * Deuxième extrémité
     */
    private Ville ville2;
    /**
     * Nombre de segments
     */
    private int longueur;
    /**
     * CouleurWagon pour capturer la route (éventuellement GRIS, mais pas LOCOMOTIVE)
     */
    private CouleurWagon couleur;
    /**
     * Joueur qui a capturé la route (`null` si la route est encore à prendre)
     */
    private Joueur proprietaire;
    /**
     * Nom unique de la route. Ce nom est nécessaire pour résoudre l'ambiguïté entre les routes doubles
     * (voir la classe Plateau pour plus de clarté)
     */
    private String nom;

    public Route(Ville ville1, Ville ville2, int longueur, CouleurWagon couleur) {
        this.ville1 = ville1;
        this.ville2 = ville2;
        this.longueur = longueur;
        this.couleur = couleur;
        nom = ville1.getNom() + " - " + ville2.getNom();
        proprietaire = null;
    }

    public Ville getVille1() {
        return ville1;
    }

    public Ville getVille2() {
        return ville2;
    }

    public int getLongueur() {
        return longueur;
    }

    public CouleurWagon getCouleur() {
        return couleur;
    }

    public Joueur getProprietaire() {
        return proprietaire;
    }

    public void setProprietaire(Joueur proprietaire) {
        this.proprietaire = proprietaire;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    /**
     * Méthode de super équipe
     * @return le nombre de points gagnés en construsant une route
     */
    public int calculerPoints(){
        int[] tableauPoints = new int[]{0,1,2,4,7,0,15,0,21};
        return tableauPoints[longueur];
    }

    public int getNbLocomotives() {
        return 0;
    }

    public boolean testFaisabiliteCouleur(List<CouleurWagon> list, CouleurWagon couleurRoute){
        int nbCouleur = 0, nbLocomotive=0;
        for (CouleurWagon couleur : list) {
            if (couleur.equals(couleurRoute)) nbCouleur++;
            if(couleur.equals(CouleurWagon.LOCOMOTIVE))nbLocomotive++;
        }
        if(longueur > nbCouleur+nbLocomotive)return false;
        return true;
    }

    public boolean testFaisabiliteGris(List<CouleurWagon> list){
        ArrayList<CouleurWagon> allCouleur=CouleurWagon.getCouleursSimples();
        for (CouleurWagon couleur : allCouleur) {
            int nbCouleur = 0, nbLocomotive=0;
            for(CouleurWagon c: list) {
                if(couleur.equals(c)) nbCouleur++;
                if(c.equals(CouleurWagon.LOCOMOTIVE))nbLocomotive++;
            }
            if(longueur <= nbCouleur+nbLocomotive)return true;
        }
        return false;
    }

    public boolean verifierCouleurWagonChoisie(CouleurWagon wagonChoisi, List<CouleurWagon> cartesWagon,
                                               List<CouleurWagon> cartesWagonPosees){
        int nbWagonNecessaire = getLongueur();
        int nbLocoEnMain = CouleurWagon.LOCOMOTIVE.compteNbCouleur(cartesWagon);

        //Si on a déjà des cartes dans cartesPoses, test si la carte choisie est valide
        if (!cartesWagonPosees.isEmpty()) {
            int nbLocoPose=CouleurWagon.LOCOMOTIVE.compteNbCouleur(cartesWagonPosees);
            //si la carte choisie n'est pas cohérente avec les cartes posées, il doit rechoisir
            if (!cartesWagonPosees.contains(CouleurWagon.LOCOMOTIVE)) {
                if (!wagonChoisi.equals(cartesWagonPosees.get(0))&&!wagonChoisi.equals(CouleurWagon.LOCOMOTIVE))
                    return false;
            }
            if (cartesWagonPosees.contains(CouleurWagon.LOCOMOTIVE)) {
                if (cartesWagonPosees.size() == nbLocoPose) {
                    if (!wagonChoisi.equals(CouleurWagon.LOCOMOTIVE)) {
                        if (!getCouleur().equals(CouleurWagon.GRIS) && !wagonChoisi.equals(getCouleur()))
                            return false;
                        if (wagonChoisi.compteNbCouleur(cartesWagon) + nbLocoEnMain + nbLocoPose < nbWagonNecessaire
                                && !wagonChoisi.equals(CouleurWagon.LOCOMOTIVE))
                            return false;
                    }
                }
                else {
                    if (!cartesWagonPosees.contains(wagonChoisi)) return false;
                }
            }
        }
        //Si c'est notre premier wagon pose, test si la carte choisie est valide
        else {
            if(!wagonChoisi.equals(CouleurWagon.LOCOMOTIVE)){
                if (getCouleur().equals(CouleurWagon.GRIS)){
                    if(wagonChoisi.compteNbCouleur(cartesWagon) + nbLocoEnMain < nbWagonNecessaire) return false;
                }
                if(!getCouleur().equals(CouleurWagon.GRIS)&&!wagonChoisi.equals(getCouleur())) return false;
            }
        }
        return true;
    }

    public boolean seConstruire(CouleurWagon wagonChoisi, Joueur joueur){
        joueur.log("Vous avez posé "+wagonChoisi.toLog());
        int nbWagonNecessaire=getLongueur();
        joueur.getCartesWagonPosees().add(wagonChoisi);
        joueur.getCartesWagon().remove(wagonChoisi);
        while (joueur.getCartesWagonPosees().size() != nbWagonNecessaire){
            String wagon = joueur.choisir("Choisir une carte wagon à poser", CouleurWagon.listeWagonToString(joueur.getCartesWagon()), new ArrayList<>(), false);
            wagonChoisi=CouleurWagon.valueOf(wagon);
            if(verifierCouleurWagonChoisie(wagonChoisi,joueur.getCartesWagon(),joueur.getCartesWagonPosees())) {
                joueur.getCartesWagonPosees().add(wagonChoisi);
                joueur.getCartesWagon().remove(wagonChoisi);
                joueur.log("Vous avez posé "+wagonChoisi.toLog());
            }
        }
        return true;
    }

    public String toLog() {
        return String.format("<span class=\"route\">%s - %s</span>", ville1.getNom(), ville2.getNom());
    }

    @Override
    public String toString() {
        return String.format("[%s - %s (%d, %s)]", ville1, ville2, longueur, couleur);
    }

    /**
     * @return un objet simple représentant les informations de la route
     */
    public Object asPOJO() {
        HashMap<String, Object> data = new HashMap<>();
        data.put("nom", getNom());
        if (proprietaire != null) {
            data.put("proprietaire", proprietaire.getCouleur());
        }
        return data;
    }
}
