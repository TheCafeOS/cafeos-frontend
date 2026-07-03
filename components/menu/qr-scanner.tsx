"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface QRScannerProps {
  onSuccess?: (qrCode: string) => void;
}

export function QRScanner({ onSuccess }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!scanning) return;

    let animationId: number;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            scanQRCode();
          };
        }
      } catch (err) {
        setError(
          "Unable to access camera. Please check permissions and try again."
        );
        setScanning(false);
      }
    };

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || !scanning) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0);

      try {
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Import jsQR dynamically
        import("jsqr").then((jsQR) => {
          const code = jsQR.default(
            imageData.data,
            imageData.width,
            imageData.height
          );

          if (code) {
            const qrValue = code.data;
            // Extract QR token from URL or direct token
            let token = qrValue;

            if (qrValue.includes("/qr/")) {
              token = qrValue.split("/qr/")[1];
            }

            if (token) {
              setScanning(false);
              if (onSuccess) {
                onSuccess(token);
              } else {
                router.push(`/menu?qr=${token}`);
              }
              return;
            }
          }

          if (scanning) {
            animationId = requestAnimationFrame(scanQRCode);
          }
        });
      } catch (err) {
        if (scanning) {
          animationId = requestAnimationFrame(scanQRCode);
        }
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(animationId);
    };
  }, [scanning, router, onSuccess]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        playsInline
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Scanning Frame */}
      <div className="relative w-64 h-64 border-4 border-orange-500 rounded-lg z-10">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500"></div>

        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-20 bg-orange-500 animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Info Text */}
      <div className="absolute bottom-20 text-center z-10">
        <p className="text-white text-lg font-semibold mb-2">
          {scanning ? "Scan Table QR Code" : "Processing..."}
        </p>
        <p className="text-gray-300 text-sm">
          Point your camera at the QR code on the table
        </p>
      </div>

      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
            <h2 className="text-lg font-bold text-red-600 mb-2">
              Camera Error
            </h2>
            <p className="text-stone-600 mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setScanning(true);
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
