'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, MapPin, RefreshCw, Navigation } from 'lucide-react';

interface WeatherData {
    temp: number;
    feels_like: number;
    humidity: number;
    description: string;
    icon: string;
    city: string;
    country: string;
}

// 한글 도시명 → 영문 매핑
const koreanCityMap: { [key: string]: string } = {
    서울: 'Seoul',
    부산: 'Busan',
    인천: 'Incheon',
    대구: 'Daegu',
    대전: 'Daejeon',
    광주: 'Gwangju',
    울산: 'Ulsan',
    수원: 'Suwon',
    제주: 'Jeju',
    강릉: 'Gangneung',
    경주: 'Gyeongju',
    전주: 'Jeonju',
    춘천: 'Chuncheon',
    포항: 'Pohang',
};

// 인기 도시 리스트
const popularCities = [
    { kr: '서울', en: 'Seoul', icon: '🏙️' },
    { kr: '부산', en: 'Busan', icon: '🌊' },
    { kr: '제주', en: 'Jeju', icon: '🏝️' },
    { kr: '인천', en: 'Incheon', icon: '✈️' },
    { kr: '대구', en: 'Daegu', icon: '🌆' },
    { kr: '대전', en: 'Daejeon', icon: '🚄' },
    { kr: '광주', en: 'Gwangju', icon: '🌃' },
    { kr: '울산', en: 'Ulsan', icon: '🏭' },
];

export default function WeatherPage() {
    const [inputCity, setInputCity] = useState('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchWeather = async (cityName: string) => {
        setLoading(true);
        setError('');

        // 한글 입력 → 영문 변환
        const englishCity = koreanCityMap[cityName] || cityName;

        try {
            const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

            if (apiKey) {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${englishCity}&appid=${apiKey}&units=metric&lang=kr`
                );

                if (!response.ok) {
                    throw new Error('도시를 찾을 수 없습니다');
                }

                const data = await response.json();
                setWeather({
                    temp: Math.round(data.main.temp),
                    feels_like: Math.round(data.main.feels_like),
                    humidity: data.main.humidity,
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                    city: data.name,
                    country: data.sys.country,
                });
            } else {
                // API 키 없을 때 샘플 데이터
                setWeather({
                    temp: 15,
                    feels_like: 13,
                    humidity: 60,
                    description: '맑음',
                    icon: '01d',
                    city: englishCity,
                    country: 'KR',
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '날씨 정보를 가져올 수 없습니다');
        } finally {
            setLoading(false);
        }
    };

    // 현재 위치 날씨 가져오기
    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('위치 정보를 지원하지 않는 브라우저입니다');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLoading(true);
                setError('');

                try {
                    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

                    if (apiKey) {
                        const response = await fetch(
                            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=kr`
                        );

                        const data = await response.json();
                        setWeather({
                            temp: Math.round(data.main.temp),
                            feels_like: Math.round(data.main.feels_like),
                            humidity: data.main.humidity,
                            description: data.weather[0].description,
                            icon: data.weather[0].icon,
                            city: data.name,
                            country: data.sys.country,
                        });
                        setInputCity(data.name);
                    } else {
                        fetchWeather('Seoul');
                    }
                } catch (err) {
                    setError('현재 위치의 날씨를 가져올 수 없습니다');
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError('위치 권한을 허용해주세요');
            }
        );
    };

    useEffect(() => {
        fetchWeather('서울');
        setInputCity('서울');
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCity.trim()) {
            fetchWeather(inputCity);
        }
    };

    const handleQuickCity = (cityEn: string, cityKr: string) => {
        setInputCity(cityKr);
        fetchWeather(cityEn);
    };

    const getWeatherIcon = (icon: string) => {
        const iconMap: { [key: string]: string } = {
            '01d': '☀️',
            '01n': '🌙',
            '02d': '⛅',
            '02n': '☁️',
            '03d': '☁️',
            '03n': '☁️',
            '04d': '☁️',
            '04n': '☁️',
            '09d': '🌧️',
            '09n': '🌧️',
            '10d': '🌦️',
            '10n': '🌧️',
            '11d': '⛈️',
            '11n': '⛈️',
            '13d': '❄️',
            '13n': '❄️',
            '50d': '🌫️',
            '50n': '🌫️',
        };
        return iconMap[icon] || '🌤️';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/utils" className="inline-flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mb-4 text-xl">🌦️</div>
                        <CardTitle className="text-3xl font-bold">날씨 정보</CardTitle>
                        <CardDescription className="text-lg">한국 및 전 세계 도시의 날씨를 확인하세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* 빠른 도시 선택 */}
                        <div>
                            <Label className="text-base font-semibold mb-3 block">🔥 인기 도시</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {popularCities.map((city) => (
                                    <Button
                                        key={city.en}
                                        variant="outline"
                                        onClick={() => handleQuickCity(city.en, city.kr)}
                                        className="h-auto py-3 flex flex-col items-center gap-1"
                                    >
                                        <span className="text-2xl">{city.icon}</span>
                                        <span className="text-xs font-semibold">{city.kr}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* 검색 폼 */}
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <Label htmlFor="city" className="text-base font-semibold">
                                    도시 검색
                                </Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        id="city"
                                        type="text"
                                        placeholder="서울, 부산, Tokyo, London..."
                                        value={inputCity}
                                        onChange={(e) => setInputCity(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={fetchCurrentLocation} disabled={loading}>
                                        <Navigation className="h-5 w-5" />
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">💡 한글(서울, 부산) 또는 영문(Seoul, Tokyo)으로 검색 가능</p>
                            </div>
                        </form>

                        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">{error}</div>}

                        {weather && !error && (
                            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-8 space-y-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {weather.city}, {weather.country}
                                    </p>
                                    <p className="text-gray-600 mt-1">
                                        {new Date().toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mb-4 text-xl">{getWeatherIcon(weather.icon)}</div>
                                    <p className="font-bold text-gray-900 text-xl">{weather.temp}°C</p>
                                    <p className="text-gray-600 mt-2 capitalize text-xl">{weather.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600 mb-1">체감 온도</p>
                                        <p className="text-2xl font-bold text-gray-900">{weather.feels_like}°C</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600 mb-1">습도</p>
                                        <p className="text-2xl font-bold text-gray-900">{weather.humidity}%</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                            <p className="font-semibold mb-2">💡 사용 팁</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>한글로 검색 가능 (서울, 부산, 제주 등)</li>
                                <li>위 인기 도시 버튼을 눌러 빠른 검색</li>
                                <li>📍 버튼으로 현재 위치 날씨 확인</li>
                                <li>실시간 기상 정보를 제공합니다</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
