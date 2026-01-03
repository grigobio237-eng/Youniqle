// [GALLERY_MASTERPIECE_V8] - First-Person Luxury Showroom with Magic Doors
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, MeshReflectorMaterial, Html, PerspectiveCamera, Float, Stars, useTexture } from '@react-three/drei';
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

function MasterpieceFrame({ id, title, image, highResImage, position, onClick, isSelected, price, rental }: {
    id: string,
    title: string,
    image?: string,
    highResImage?: string,
    position: [number, number, number],
    onClick: (id: string) => void,
    isSelected?: boolean,
    price?: string,
    rental?: string
}) {
    // Always call hooks unconditionally, use fallback to base64 transparent pixel
    const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const lowResTexture = useTexture(image || transparentPixel);
    const highResTexture = useTexture((highResImage && isSelected) ? highResImage : transparentPixel);

    // Use high res if selected and available, otherwise low res
    const texture = (highResImage && isSelected) ? highResTexture : (image ? lowResTexture : null);

    return (
        <group
            position={position}
            onClick={(e) => { e.stopPropagation(); onClick(id); }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
            {/* Compact Premium Frame */}
            <mesh
                castShadow
                onClick={(e) => { e.stopPropagation(); onClick(id); }}
            >
                <boxGeometry args={[isSelected ? 4.5 : 3.5, isSelected ? 5.5 : 4.5, 0.3]} />
                <meshStandardMaterial color={isSelected ? "#FFD700" : "#D4AF37"} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* High Definition Artwork */}
            <mesh
                position={[0, 0, 0.16]}
                onClick={(e) => { e.stopPropagation(); onClick(id); }}
            >
                <planeGeometry args={[isSelected ? 4.2 : 3.2, isSelected ? 5.2 : 4.2]} />
                {texture ? (
                    <meshStandardMaterial map={texture} roughness={0.2} metalness={0} />
                ) : (
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
                )}
            </mesh>

            <Html position={[0, -2.6, 0.3]} center distanceFactor={8}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 1 : 0.8 }}
                    className={`text-center group pointer-events-none transition-opacity duration-500`}
                >
                    <div className="bg-obsidian/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#D4AF37]/30 shadow-2xl transition-all group-hover:bg-white group-hover:scale-105">
                        <h6 className="text-xs font-black text-[#D4AF37] uppercase tracking-tight mb-1 italic">{title}</h6>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-wider">Pricing Plan</span>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[8px] font-black text-white group-hover:text-obsidian uppercase">Sale: {price}</span>
                                {rental && <span className="text-[8px] font-black text-[#D4AF37] uppercase">Rent: {rental}/mo</span>}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Html>

            {/* Spotlight from top */}
            <spotLight position={[0, 10, 5]} angle={0.3} penumbra={1} intensity={100} target={new THREE.Object3D().translateZ(position[2])} />
        </group>
    );
}

// Custom First-Person Camera controller
function FPController({
    isInsideRoom,
    activeFloor,
    selectedOwnerId,
    selectedItemId,
    floorData
}: {
    isInsideRoom: boolean,
    activeFloor: number,
    selectedOwnerId: string | null,
    selectedItemId: string | null,
    floorData: FloorOwner[]
}) {
    const { camera } = useThree();
    const targetPos = useRef(new THREE.Vector3(0, 5, 12));
    const targetLookAt = useRef(new THREE.Vector3(0, 3, 0));

    useFrame((state) => {
        if (selectedItemId) {
            // "Frontal View" focusing on the artwork
            const owners = floorData || [];
            const owner = owners.find((o: FloorOwner) => o.id === selectedOwnerId);
            if (owner) {
                const itemIndex = owner.items.findIndex(item => item.id === selectedItemId);
                if (itemIndex !== -1) {
                    const totalItems = owner.items.length;
                    const spacing = 12;
                    const xPos = (itemIndex - (totalItems - 1) / 2) * spacing;

                    // Position camera right in front of the artwork
                    targetPos.current.set(xPos, 3.5, -5); // -14.7 is wall, -5 gives some breathing room
                    targetLookAt.current.set(xPos, 3.5, -14.7);
                }
            }
        } else if (isInsideRoom) {
            // Intimate 1st person exhibition view - Camera higher and closer to wall
            targetPos.current.set(0, 5, 6); // Raised from 3.5 to 5, moved closer from 8 to 6
            targetLookAt.current.set(0, 4.5, -15); // Look slightly higher
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
                case 2: targetPos.current.set(0, 6, 22); break;
                case 3: targetPos.current.set(0, 5, 20); break;
                case 4: targetPos.current.set(0, 4.5, 18); break;
                case 5: targetPos.current.set(0, 4, 15); break;
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
    selectedItemId,
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
    selectedItemId: string | null;
    isInsideRoom: boolean;
    onReady?: () => void;
    onArtistClick: (id: string) => void;
    onArtworkClick: (id: string) => void;
    onEnterRoom: () => void;
    floorData: FloorOwner[];
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
                <FPController
                    isInsideRoom={isInsideRoom}
                    activeFloor={activeFloor}
                    selectedOwnerId={selectedArtistId}
                    selectedItemId={selectedItemId}
                    floorData={floorData}
                />

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

                            {/* Magic Door Appearance - Only for non-gallery floors with 3D lobbies */}
                            {selectedArtistId && activeFloor !== 1 && (
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

                            {/* Room Walls - Enlarged for more artwork space */}
                            <mesh position={[0, 7, -15]} frustumCulled={true}>
                                <boxGeometry args={[80, 20, 0.5]} />
                                <meshStandardMaterial
                                    color={activeFloor === 1 ? "#F8F9FA" : (activeFloor === 5 ? "#000000" : "#0B0D10")}
                                    metalness={activeFloor === 1 ? 0 : 0.8}
                                    roughness={activeFloor === 1 ? 1 : 0.1}
                                    emissive={activeFloor === 1 ? "#ffffff" : "#000000"}
                                    emissiveIntensity={activeFloor === 1 ? 0.05 : 0}
                                />
                            </mesh>

                            {/* Dynamic Content Frames based on selected artist */}
                            {selectedOwner?.items?.map((item, index) => {
                                const total = selectedOwner.items.length;

                                // Adjust spacing based on number of items to fit within camera view
                                let spacing = 10;
                                let rows = 1;
                                let itemsPerRow = total;

                                // Dynamic layout: support up to 8 items per row
                                if (total > 8) {
                                    // More than 8: use 2 rows, distribute evenly
                                    rows = 2;
                                    itemsPerRow = Math.ceil(total / 2);
                                    spacing = Math.max(4, Math.min(10, 70 / itemsPerRow)); // Scale down for many items
                                } else if (total > 4) {
                                    // 5-8 items: use 2 rows with up to 4-8 items per row
                                    rows = 2;
                                    itemsPerRow = Math.ceil(total / 2);
                                    spacing = Math.min(10, 40 / itemsPerRow);
                                } else if (total > 2) {
                                    // 3-4 items: single row
                                    spacing = Math.min(10, 35 / total);
                                }

                                // Calculate position
                                const row = Math.floor(index / itemsPerRow);
                                const col = index % itemsPerRow;
                                const itemsInCurrentRow = (row === rows - 1) ? (total - (rows - 1) * itemsPerRow) : itemsPerRow;

                                const xPos = (col - (itemsInCurrentRow - 1) / 2) * spacing;
                                const yPos = rows === 1 ? 7 : (row === 0 ? 10 : 4); // Increased gap: 10 - 4 = 6 for namecard space

                                return (
                                    <MasterpieceFrame
                                        key={item.id}
                                        id={item.id}
                                        title={item.title}
                                        image={item.image}
                                        highResImage={item.image}
                                        position={[xPos, yPos, -14.7]}
                                        onClick={onArtworkClick}
                                        isSelected={selectedItemId === item.id}
                                        price={item.price}
                                        rental={item.rental}
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

                            {/* Inner Room Floor */}
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                                <planeGeometry args={[100, 100]} />
                                <MeshReflectorMaterial
                                    blur={[0, 0]}
                                    resolution={1024}
                                    mixBlur={0}
                                    mixStrength={10}
                                    roughness={activeFloor === 1 ? 0.2 : 1}
                                    depthScale={0}
                                    minDepthThreshold={1}
                                    maxDepthThreshold={1}
                                    color={activeFloor === 1 ? "#ffffff" : "#000000"}
                                    metalness={activeFloor === 1 ? 0.1 : 0.5}
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

