// [GALLERY_MASTERPIECE_V8] - First-Person Luxury Showroom with Magic Doors
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, MeshReflectorMaterial, Html, PerspectiveCamera, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { User } from 'lucide-react';
import { FloorOwner } from '@/app/pavilion/page';

// --- Components ---

// --- Sub-Components ---

function SpecialistCard({
    id,
    name,
    role,
    position,
    onClick,
    isActive,
    activeFloor
}: {
    id: string,
    name: string,
    role: string,
    position: [number, number, number],
    onClick: (id: string) => void,
    isActive: boolean,
    activeFloor: number
}) {
    return (
        <group position={position}>
            {/* Clickable Hitbox Mesh - Absolute top layer for event capture */}
            <mesh
                position={[0, 0, 0.4]}
                onClick={(e) => { e.stopPropagation(); onClick(id); }}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                <planeGeometry args={[2.8, 4]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Minimalist Profile Card */}
            <mesh
                castShadow
                onClick={(e) => { e.stopPropagation(); onClick(id); }}
            >
                <planeGeometry args={[2.8, 4]} />
                <meshStandardMaterial
                    color={isActive ? "#ffffff" : (activeFloor === 5 ? "#1A1D21" : "#f8f8f8")}
                    metalness={0.4}
                    roughness={0.2}
                />
            </mesh>

            {/* Information Overlay - Explicitly disable pointer events to allow 3D Interaction through it */}
            <Html
                position={[0, 0, 0.05]}
                center
                transform
                distanceFactor={5.5}
                pointerEvents="none"
            >
                <div
                    style={{ pointerEvents: 'none' }}
                    className={`w-48 aspect-[3/4] p-6 flex flex-col items-center text-center transition-all duration-500 pointer-events-none
                        ${isActive ? 'bg-white/95 scale-105' : (activeFloor === 5 ? 'bg-black/80 text-white border-white/10' : 'bg-white/70')} rounded-2xl border border-white/40 shadow-xl`}
                >
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 transition-colors ${isActive ? 'bg-obsidian text-white' : 'bg-mist text-obsidian/40'}`}>
                            <User className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">{activeFloor}층</p>
                            <h5 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap leading-tight">{name}</h5>
                            <p className="text-[9px] font-extrabold text-[#D4AF37] uppercase tracking-widest">{role}</p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-mist/20 my-4" />

                    <div className="text-[8px] font-black tracking-[0.3em] uppercase opacity-60">
                        {isActive ? '포탈 활성화' : '정보 보기'}
                    </div>
                </div>
            </Html>

            {isActive && (
                <mesh position={[0, 0, -0.1]}>
                    <planeGeometry args={[3, 4.2]} />
                    <meshBasicMaterial color="#D4AF37" transparent opacity={0.4} />
                </mesh>
            )}
        </group>
    );
}

const FPGUIDE = ({ isInsideRoom }: { isInsideRoom: boolean }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible || isInsideRoom) return null;

    return (
        <div className="absolute inset-x-0 bottom-24 flex items-center justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="bg-obsidian/90 backdrop-blur-md px-10 py-5 rounded-[28px] border border-white/10 flex items-center gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        {['W', 'A', 'S', 'D'].map(k => (
                            <kbd key={k} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-[10px] font-black text-white border border-white/10 shadow-inner">{k}</kbd>
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">이동</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-4">
                    <div className="w-5 h-8 border-2 border-white/20 rounded-full relative">
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/60 rounded-full" />
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">둘러보기</span>
                </div>
            </div>
        </div>
    );
};

function MagicDoor({ position, isActive, onEnter }: { position: [number, number, number], isActive: boolean, onEnter: () => void }) {
    if (!isActive) return null;

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onEnter(); }}>
            {/* Portal Glow */}
            <mesh position={[0, 0, 0.1]}>
                <planeGeometry args={[3, 5]} />
                <meshBasicMaterial color="#D4AF37" transparent opacity={0.4} />
            </mesh>
            {/* The Magic Gate - Emissive White/Gold */}
            <mesh position={[0, 0, 0.2]} castShadow>
                <boxGeometry args={[2.8, 4.8, 0.1]} />
                <meshStandardMaterial color="#ffffff" emissive="#D4AF37" emissiveIntensity={2} metalness={1} roughness={0} />
            </mesh>

            <Html position={[0, 0, 1]} center distanceFactor={10}>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-10 py-5 bg-obsidian text-white font-black uppercase text-xs tracking-[0.4em] rounded-full shadow-[0_0_50px_rgba(212,175,55,0.5)] border-2 border-[#D4AF37] hover:scale-110 transition-transform whitespace-nowrap pointer-events-auto"
                >
                    갤러리 입장하기
                </motion.button>
            </Html>
        </group>
    );
}

function MasterpieceFrame({ id, title, position, onClick }: { id: string, title: string, position: [number, number, number], onClick: (id: string) => void }) {
    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick(id); }}>
            {/* Bold Premium Frame */}
            <mesh castShadow>
                <boxGeometry args={[4.5, 6, 0.4]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* High Definition Artwork Placeholder */}
            <mesh position={[0, 0, 0.21]}>
                <planeGeometry args={[4, 5.5]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
            </mesh>

            <Html position={[0, -3.8, 0.3]} center distanceFactor={8}>
                <div className="text-center group pointer-events-none">
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] block mb-2 drop-shadow-lg">Purchase / Rental</span>
                    <div className="bg-obsidian px-6 py-2 rounded-full border border-[#D4AF37]/30 shadow-2xl transition-all group-hover:bg-white group-hover:scale-110">
                        <h6 className="text-sm font-black text-white group-hover:text-obsidian uppercase tracking-tighter whitespace-nowrap italic">{title}</h6>
                    </div>
                </div>
            </Html>

            {/* Spotlight from top */}
            <spotLight position={[0, 10, 5]} angle={0.3} penumbra={1} intensity={100} target={new THREE.Object3D().translateZ(position[2])} />
        </group>
    );
}

// Custom First-Person Camera controller
function FPController({ isInsideRoom, activeFloor, selectedOwnerId, floorData }: { isInsideRoom: boolean, activeFloor: number, selectedOwnerId: string | null, floorData: FloorOwner[] }) {
    const { camera } = useThree();
    const targetPos = useRef(new THREE.Vector3(0, 5, 12));
    const targetLookAt = useRef(new THREE.Vector3(0, 3, 0));

    useFrame((state) => {
        if (isInsideRoom) {
            // Intimate 1st person exhibition view (All floors)
            targetPos.current.set(0, 3.5, 8);
            targetLookAt.current.set(0, 3.5, -15);
        } else if (selectedOwnerId) {
            // Zoom into the magic door area (All floors)
            const owners = floorData || [];
            const index = owners.findIndex(o => o.id === selectedOwnerId);
            const total = owners.length;
            const spacing = 8;
            const areaPos = index !== -1 ? (index - (total - 1) / 2) * spacing : 0;

            targetPos.current.set(areaPos, 4, 6);
            targetLookAt.current.set(areaPos, 3, -10);
        } else {
            // Standard floor-specific lobby views
            switch (activeFloor) {
                case 1: targetPos.current.set(0, 4.5, 18); break;
                case 2: targetPos.current.set(0, 6, 22); break; // Deeper for shop
                case 3: targetPos.current.set(0, 5, 20); break;
                case 4: targetPos.current.set(0, 4.5, 18); break;
                case 5: targetPos.current.set(0, 4, 15); break; // Closer for suite
                default: targetPos.current.set(0, 4.5, 18);
            }
            targetLookAt.current.set(0, 3, 0);
        }

        state.camera.position.lerp(targetPos.current, 0.04);
        state.camera.lookAt(targetLookAt.current);
    });

    return null;
}
// Decorative elements to fill the lobby space
function LobbyDecor({ activeFloor }: { activeFloor: number }) {
    return (
        <group>
            {/* Floor 5 (Omakase Suite) - Luxury night lounge vibe */}
            {activeFloor === 5 && (
                <>
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                        <mesh position={[-15, 8, -10]}>
                            <torusGeometry args={[3, 0.05, 16, 100]} />
                            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={2} />
                        </mesh>
                    </Float>
                    <Float speed={3} rotationIntensity={2} floatIntensity={1}>
                        <mesh position={[18, 5, -5]}>
                            <torusGeometry args={[2, 0.02, 16, 100]} />
                            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1.5} />
                        </mesh>
                    </Float>
                    {/* Floating Crystals */}
                    {[...Array(5)].map((_, i) => (
                        <Float key={i} speed={1 + i} rotationIntensity={2} floatIntensity={2}>
                            <mesh position={[Math.sin(i) * 15, 5 + i, -15 + i]}>
                                <octahedronGeometry args={[0.3, 0]} />
                                <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={4} />
                            </mesh>
                        </Float>
                    ))}
                    <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={2} color="#D4AF37" castShadow />
                    <gridHelper args={[100, 20, "#D4AF37", "#1A1D21"]} position={[0, -0.01, 0]} />
                </>
            )}

            {/* General ambiance for other floors */}
            {activeFloor !== 5 && (
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <mesh position={[20, 15, -10]} rotation={[Math.PI / 4, 0, 0]}>
                        <sphereGeometry args={[0.5, 32, 32]} />
                        <meshStandardMaterial color="#D4AF37" transparent opacity={0.3} />
                    </mesh>
                </Float>
            )}
        </group>
    );
}

export default function ConventionCenter({
    activeFloor,
    selectedArtistId,
    selectedOwner,
    isInsideRoom,
    onReady,
    onArtistClick,
    onArtworkClick,
    onEnterRoom,
    floorData
}: {
    activeFloor: number;
    selectedArtistId: string | null;
    selectedOwner: FloorOwner | null;
    isInsideRoom: boolean;
    onReady?: () => void;
    onArtistClick: (id: string) => void;
    onArtworkClick: (id: string) => void;
    onEnterRoom: () => void;
    floorData: FloorOwner[]; // PAVILION_DATA 대신 부모(page.tsx)로부터 데이터를 전달받음
}) {

    useEffect(() => {
        if (onReady) onReady();
    }, [onReady]);

    const activeColor =
        activeFloor === 1 ? '#F8F9FA' : // Art (White)
            activeFloor === 2 ? '#E9ECEF' : // Shop (Silver)
                activeFloor === 3 ? '#FDEBD0' : // Sports (Warm Energy)
                    activeFloor === 4 ? '#EBF5FB' : // Medical (Clean Blue)
                        '#0B0D10'; // Omakase (Dark Gold)

    const wallColor =
        activeFloor === 5 ? '#0B0D10' : '#ffffff';

    const accentColor =
        activeFloor === 5 ? '#D4AF37' : '#D4AF37';

    return (
        <div style={{ width: '100%', height: '100%', background: activeFloor === 5 ? '#030303' : activeColor }}>
            <Canvas shadows={false}>
                <PerspectiveCamera makeDefault fov={45} />
                <FPController isInsideRoom={isInsideRoom} activeFloor={activeFloor} selectedOwnerId={selectedArtistId} floorData={floorData} />

                <color attach="background" args={[activeFloor === 5 ? '#030303' : activeColor]} />
                <fog attach="fog" args={[activeFloor === 5 ? '#000000' : activeColor, 15, 80]} />

                <ambientLight intensity={activeFloor === 5 ? 0.2 : 0.8} />
                <hemisphereLight intensity={activeFloor === 5 ? 0.3 : 1.2} color="#ffffff" groundColor="#f0f0f0" />
                <pointLight position={[10, 20, 10]} intensity={activeFloor === 5 ? 30 : 200} />
                <spotLight position={[0, 40, 20]} angle={0.6} penumbra={1} intensity={activeFloor === 5 ? 50 : 500} castShadow />

                <LobbyDecor activeFloor={activeFloor} />

                {/* FP Navigation Guide */}
                <Html fullscreen portal={undefined} className="pointer-events-none">
                    <FPGUIDE isInsideRoom={isInsideRoom} />
                </Html>

                {/* --- Dynamic Floor Rendering --- */}
                <group>
                    {!isInsideRoom ? (
                        <group>
                            {/* Luxury Showroom Walls */}
                            <mesh position={[0, 10, -20]}>
                                <boxGeometry args={[100, 20, 1]} />
                                <meshStandardMaterial color={wallColor} roughness={0.1} />
                            </mesh>

                            {/* Specialist Cards based on floor */}
                            {floorData?.map((owner, index) => {
                                const total = floorData.length;
                                const spacing = 8;
                                const xPos = (index - (total - 1) / 2) * spacing;
                                return (
                                    <SpecialistCard
                                        key={owner.id}
                                        id={owner.id}
                                        name={owner.name}
                                        role={owner.role}
                                        position={[xPos, 4, -19.4]}
                                        onClick={onArtistClick}
                                        isActive={selectedArtistId === owner.id}
                                        activeFloor={activeFloor}
                                    />
                                );
                            })}

                            {/* Magic Door Appearance */}
                            {selectedArtistId && (
                                <MagicDoor
                                    position={[
                                        (floorData?.findIndex(o => o.id === selectedArtistId) - (floorData?.length - 1) / 2) * 8,
                                        4,
                                        -19.2
                                    ]}
                                    isActive={true}
                                    onEnter={onEnterRoom}
                                />
                            )}

                            {/* Floor Material */}
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                                <planeGeometry args={[100, 100]} />
                                <MeshReflectorMaterial
                                    blur={[0, 0]}
                                    resolution={1024}
                                    mixBlur={0}
                                    mixStrength={activeFloor === 5 ? 5 : 20}
                                    roughness={1}
                                    depthScale={0}
                                    minDepthThreshold={1}
                                    maxDepthThreshold={1}
                                    color={activeFloor === 5 ? "#111111" : "#fcfcfc"}
                                    metalness={activeFloor === 5 ? 1 : 0.1}
                                    mirror={0.6}
                                    distortion={0}
                                />
                            </mesh>
                        </group>
                    ) : (
                        /* --- Inside Room View (Dynamic Gallery) --- */
                        <group position={[0, 0, -20]}>
                            <Stars radius={100} depth={50} count={activeFloor === 5 ? 10000 : 5000} factor={4} saturation={0} fade speed={1} />

                            {/* Dark Room Walls */}
                            <mesh position={[0, 5, -15]}>
                                <boxGeometry args={[60, 15, 0.5]} />
                                <meshStandardMaterial color={activeFloor === 5 ? "#000000" : "#0B0D10"} metalness={0.8} roughness={0.1} />
                            </mesh>

                            {/* Dynamic Content Frames based on selected artist */}
                            {selectedOwner?.items.map((item, index) => {
                                const total = selectedOwner.items.length;
                                const spacing = 12;
                                const xPos = (index - (total - 1) / 2) * spacing;
                                return (
                                    <MasterpieceFrame
                                        key={item.id}
                                        id={item.id}
                                        title={item.title}
                                        position={[xPos, 3.5, -14.7]}
                                        onClick={onArtworkClick}
                                    />
                                );
                            })}

                            <Html position={[0, 10, -14]} center>
                                <div className="text-center">
                                    <h2 className="text-6xl font-black text-[#D4AF37]/20 uppercase tracking-[1.5em] whitespace-nowrap select-none italic">
                                        {activeFloor === 5 ? 'ULTIMATE SUITE' : `${selectedOwner?.name?.toUpperCase()} ARCHIVE`}
                                    </h2>
                                </div>
                            </Html>

                            {/* Dark Polished Floor */}
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                                <planeGeometry args={[100, 100]} />
                                <MeshReflectorMaterial
                                    blur={[0, 0]}
                                    resolution={1024}
                                    mixBlur={0}
                                    mixStrength={10}
                                    roughness={1}
                                    depthScale={0}
                                    minDepthThreshold={1}
                                    maxDepthThreshold={1}
                                    color="#000000"
                                    metalness={0.5}
                                    mirror={0.7}
                                />
                            </mesh>
                        </group>
                    )}
                </group>

                <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={80} blur={3} far={20} />
            </Canvas>
        </div>
    );
}

