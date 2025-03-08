import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X } from "lucide-react";
import { AddSectionDialog } from "./dialogs/AddSectionDialog";

interface SectionMeta {
  name: string;
  deletable: boolean;
  renamable: boolean;
}

interface ProfileTabsProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  coreSectionKeys: string[];
  customSectionKeys: string[];
  sectionMeta: Record<string, SectionMeta>;
  renamingSectionKey: string;
  setRenamingSectionKey: (key: string) => void;
  newSectionName: string;
  setNewSectionName: (name: string) => void;
  handleAddSection: (sectionName: string) => void;
  handleRenameSection: (oldKey: string, newName: string, isCore?: boolean) => void;
  handleDeleteSection: (key: string, isCore?: boolean) => void;
  children: React.ReactNode;
}

export const ProfileTabs = ({
  selectedTab,
  setSelectedTab,
  coreSectionKeys,
  customSectionKeys,
  sectionMeta,
  renamingSectionKey,
  setRenamingSectionKey,
  newSectionName,
  setNewSectionName,
  handleAddSection,
  handleRenameSection,
  handleDeleteSection,
  children
}: ProfileTabsProps) => {
  // Helper function to format section names for display
  const formatSectionName = (key: string) => {
    if (sectionMeta[key]) {
      return sectionMeta[key].name;
    }
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
  };

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <TabsList className="flex flex-wrap w-full h-auto p-1">
          {coreSectionKeys.map(key => (
            <TabsTrigger 
              key={key} 
              value={key} 
              className="relative group min-w-[120px] h-10 px-4 py-2 text-base"
            >
              {renamingSectionKey === key ? (
                <div className="flex items-center w-full">
                  <Input
                    value={newSectionName}
                    onChange={e => setNewSectionName(e.target.value)}
                    className="h-7 min-w-[100px]"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleRenameSection(key, newSectionName, true);
                      } else if (e.key === 'Escape') {
                        setRenamingSectionKey("");
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={e => {
                      e.stopPropagation();
                      handleRenameSection(key, newSectionName, true);
                    }}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={e => {
                      e.stopPropagation();
                      setRenamingSectionKey("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="mr-6 truncate">{formatSectionName(key)}</span>
                  {sectionMeta[key] && (sectionMeta[key].renamable || sectionMeta[key].deletable) && (
                    <div className="hidden group-hover:flex items-center space-x-1 ml-auto">
                      {sectionMeta[key].renamable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-70 hover:opacity-100"
                          onClick={e => {
                            e.stopPropagation();
                            setRenamingSectionKey(key);
                            setNewSectionName(formatSectionName(key));
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {sectionMeta[key].deletable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-70 hover:opacity-100"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteSection(key, true);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsTrigger>
          ))}
          {customSectionKeys.map(key => (
            <TabsTrigger 
              key={key} 
              value={`custom-${key}`} 
              className="relative group min-w-[120px] h-10 px-4 py-2 text-base"
            >
              {renamingSectionKey === key ? (
                <div className="flex items-center w-full">
                  <Input
                    value={newSectionName}
                    onChange={e => setNewSectionName(e.target.value)}
                    className="h-7 min-w-[100px]"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleRenameSection(key, newSectionName);
                      } else if (e.key === 'Escape') {
                        setRenamingSectionKey("");
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={e => {
                      e.stopPropagation();
                      handleRenameSection(key, newSectionName);
                    }}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={e => {
                      e.stopPropagation();
                      setRenamingSectionKey("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="mr-6 truncate">{formatSectionName(key)}</span>
                  <div className="hidden group-hover:flex items-center space-x-1 ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-70 hover:opacity-100"
                      onClick={e => {
                        e.stopPropagation();
                        setRenamingSectionKey(key);
                        setNewSectionName(formatSectionName(key));
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-70 hover:opacity-100"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteSection(key);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex-shrink-0">
          <AddSectionDialog onAdd={handleAddSection} />
        </div>
      </div>
      
      {children}
    </Tabs>
  );
}; 