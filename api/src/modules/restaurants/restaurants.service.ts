import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ActionType } from '@prisma/client';
import { UserActionsService } from '../user-actions/user-actions.service';
import { NearbyRestaurantsDto } from './dto/nearby-restaurants.dto';
import { Request } from 'express';

@Injectable()
export class RestaurantsService {
    constructor(
        private readonly configService: ConfigService,
        private readonly userActionsService: UserActionsService,
    ) { }
    // buscamos restaurantes cercanos basado en ciudad o coordenadas
    async findNearby(userId: number, query: NearbyRestaurantsDto, request?: Request) {
        let lat = query.lat;
        let lng = query.lng;

        if (query.city) {
            const point = await this.geocodeCity(query.city);
            lat = point.lat;
            lng = point.lng;
        }

        if (lat === undefined || lng === undefined) {
            throw new BadRequestException('Debes enviar ciudad o latitud y longitud');
        }

        const restaurants = await this.searchRestaurants(lat, lng);
        // Registramos la acción del usuario
        await this.userActionsService.register({
            userId,
            action: ActionType.RESTAURANTS_SEARCH,
            metadata: {
                city: query.city ?? null,
                lat,
                lng,
                results: restaurants.length,
            },
            ip: request?.ip,
            userAgent: request?.headers['user-agent'],
        });

        return {
            search: { city: query.city ?? null, lat, lng },
            data: restaurants,
        };
    }
    private getTimeoutMs() {
        const raw = this.configService.get<string>('HTTP_TIMEOUT_MS');
        const parsed = Number(raw);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
        return 8000;
    }

    // función para obtener latitud y longitud apartir de la ciudad
    private async geocodeCity(city: string) {
        const apiKey = this.configService.get<string>('RESTAURANTS_API_KEY');
        const geocodingUrl = this.configService.get<string>('GEOCODING_BASE_URL');

        if (!apiKey || !geocodingUrl) {
            throw new InternalServerErrorException('Falta configurar geocoding');
        }

        try {
            const response = await axios.get(geocodingUrl, {
                params: { text: city, limit: 1, apiKey },
                timeout: this.getTimeoutMs(),
            });

            const feature = response.data?.features?.[0];
            if (!feature) throw new BadRequestException('Ciudad no encontrada');

            return {
                lat: feature.properties.lat,
                lng: feature.properties.lon,
            };
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('No se pudo geocodificar la ciudad');
        }
    }
    // busca restaurantes cercanos usando la API externa
    private async searchRestaurants(lat: number, lng: number) {
        const apiKey = this.configService.get<string>('RESTAURANTS_API_KEY');
        const restaurantsUrl = this.configService.get<string>('RESTAURANTS_BASE_URL');

        if (!apiKey || !restaurantsUrl) {
            throw new InternalServerErrorException('Falta configurar API de restaurantes');
        }

        try {
            const response = await axios.get(restaurantsUrl, {
                params: {
                    categories: 'catering.restaurant',
                    filter: `circle:${lng},${lat},5000`,
                    bias: `proximity:${lng},${lat}`,
                    limit: 20,
                    apiKey,
                },
                timeout: this.getTimeoutMs(),
            });

            const features = response.data?.features ?? [];

            return features.map((item: any) => ({
                name: item.properties.name ?? 'Sin nombre',
                address: item.properties.formatted ?? null,
                lat: item.properties.lat,
                lng: item.properties.lon,
                placeId: item.properties.place_id ?? null,
            }));
        } catch (error) {
            throw new InternalServerErrorException('No se pudo consultar restaurantes');
        }
    }
}
