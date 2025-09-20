
import type { Recommendation } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Briefcase } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale'; // Import Spanish locale

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const timeAgo = formatDistanceToNow(new Date(recommendation.createdAt), { addSuffix: true, locale: es });

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://www.freympc.com/workrecs/0001.jpg" alt={recommendation.userName} /> 
            <AvatarFallback>
              <UserCircle size={24} />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{recommendation.userName}</CardTitle>
            {recommendation.userSector && (
              <CardDescription className="flex items-center gap-1 text-xs">
                <Briefcase size={12} /> {recommendation.userSector}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground leading-relaxed">{recommendation.text}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <Badge variant="secondary">{recommendation.sector}</Badge>
        <span>{timeAgo}</span>
      </CardFooter>
    </Card>
  );
}
