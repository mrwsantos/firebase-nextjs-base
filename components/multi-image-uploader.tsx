import React, { useRef } from "react";
import { Button } from "./ui/button";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { MoveIcon, XIcon } from "lucide-react";

export type ImageUpload = {
  id: string; // Unique identifier for the image
  url: string; // URL of the uploaded image
  file?: File; // Optional file object for the imagexx
};

type Props = {
  images?: ImageUpload[]; // Array of image objects
  onImagesChange: (images: ImageUpload[]) => void; // Callback function to handle image changes
};

const MultiImageUploader = ({ images = [], onImagesChange }: Props) => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file, index) => {
      return {
        id: `${Date.now()}-${index}-${file.name}`,
        url: URL.createObjectURL(file),
        file,
      };
    });

    onImagesChange([...images, ...newImages]);
  };

  const handleDragEnd = (result: DropResult) => {
    if(!result.destination) return; // If dropped outside a droppable area, do nothing
  
    const items: ImageUpload[] = Array.from(images);
    const [reorderedImage] = items.splice(result.source.index, 1); // Remove the dragged item from its original position
    items.splice(result.destination.index,0,reorderedImage); // Insert it at the new position
    onImagesChange(items); // Update the state with the new order
  };

  const handleDelete = (id: string) => {
   const updatedImages = images.filter((image) => image.id !== id);
   onImagesChange(updatedImages); // Update the state with the new images array
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <input
        ref={uploadInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      <Button
        className="w-full"
        variant={"outline"}
        type="button"
        onClick={() => uploadInputRef?.current?.click()}
      >
        Upload Documents
      </Button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="asset-images" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="relative p-2"
                    >
                      <div className="bg-gray-100 rounded-md flex gap-2 items-center overflow-hidden">
                        <div className="size-16 relative">
                          <Image
                            src={image.url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-normal">
                            Image {index + 1}
                          </p>
                          {index === 0 && <Badge variant={"success"}>Featured Image</Badge>}
                        </div>
                        <div className="flex items-center px-2 ">
                          <button onClick={()=>handleDelete(image.id)} className=" p-2 text-red-500 hover:text-red-700 transition-colors duration-200">
                            <XIcon />
                          </button>
                          <div className="text-gray-500 cursor-move hover:text-gray-700 transition-colors duration-200">
                            <MoveIcon />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default MultiImageUploader;
