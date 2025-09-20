
"use client";

import { useEffect, useState, useMemo } from 'react';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import type { Recommendation, ProfessionalSector } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROFESSIONAL_SECTORS } from "@/lib/constants";
import { Input } from '@/components/ui/input';
import { ListFilter, Search, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getStoredRecommendations } from '@/lib/services/recommendationDataService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';

export default function HomePage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedSector, setSelectedSector] = useState<ProfessionalSector | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPageData() {
      setPageIsLoading(true);
      setFetchError(null);

      // Set user-specific sector if available, otherwise default to 'All'
      if (user?.professionalSector) {
        setSelectedSector(user.professionalSector);
      } else {
        setSelectedSector('All');
      }

      // Fetch recommendations
      try {
        const fetchedRecs = await getStoredRecommendations();
        fetchedRecs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecommendations(fetchedRecs);
      } catch (error: any) {
        console.error("Error fetching recommendations on page:", error);
        let errorMessage = "No se pudieron cargar las recomendaciones. Por favor, inténtalo de nuevo más tarde.";
        if (error.code === 'permission-denied') {
          errorMessage = "No se pudieron cargar las recomendaciones debido a un problema de permisos. Revisa las reglas de seguridad de Firestore o contacta a soporte.";
        }
        setFetchError(errorMessage);
      } finally {
        setPageIsLoading(false);
      }
    }

    // Only run the logic once the authentication status is resolved
    if (!authIsLoading) {
      loadPageData();
    }
  }, [user, authIsLoading]);


  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const sectorMatch = selectedSector === 'All' || rec.sector === selectedSector;
      const searchMatch = searchTerm === '' || 
                          rec.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.sector.toLowerCase().includes(searchTerm.toLowerCase());
      return sectorMatch && searchMatch;
    });
  }, [recommendations, selectedSector, searchTerm]);

  if (pageIsLoading || authIsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="h-10 w-full sm:w-1/3 animate-pulse rounded-md bg-muted"></div>
          <div className="h-10 w-full sm:w-2/3 animate-pulse rounded-md bg-muted"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full animate-pulse bg-muted"></div>
                <div className="space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded-md bg-muted"></div>
                  <div className="h-3 w-24 animate-pulse rounded-md bg-muted"></div>
                </div>
              </div>
              <div className="h-16 w-full animate-pulse rounded-md bg-muted"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 animate-pulse rounded-md bg-muted"></div>
                <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Descubre Recomendaciones Profesionales
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Encuentra servicios y profesionales de confianza recomendados por tus colegas en Madrid.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-card rounded-lg shadow">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Buscar recomendaciones..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar recomendaciones"
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select 
            value={selectedSector} 
            onValueChange={(value) => setSelectedSector(value as ProfessionalSector | 'All')}
          >
            <SelectTrigger className="w-full" aria-label="Filtrar por sector">
              <ListFilter size={16} className="mr-2"/>
              <SelectValue placeholder="Filtrar por sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Todos los Sectores</SelectItem>
              {PROFESSIONAL_SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al Cargar Recomendaciones</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!fetchError && filteredRecommendations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      ) : !fetchError && (
        <div className="text-center py-12">
          <Image src="https://www.freympc.com/workrecs/0000.jpg" width={300} height={200} data-ai-hint="empty results" alt="No se encontraron recomendaciones" className="mx-auto mb-6 rounded-lg" />
          <h3 className="text-xl font-semibold mb-2">Aún No Hay Recomendaciones</h3>
          <p className="text-muted-foreground mb-4">
            {selectedSector === 'All' && searchTerm === '' 
              ? "¡Sé el primero en compartir una recomendación en tu red!" 
              : "Ninguna recomendación coincide con tus filtros actuales. Prueba una búsqueda o sector diferente."}
          </p>
          {user && (
            <Button asChild>
              <Link href="/recommendations/new">Compartir una Recomendación</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
