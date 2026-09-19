import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Mail, MailOpen, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  template_id: string | null;
  template_title: string | null;
  is_read: boolean;
  created_at: string;
}

export const ContactList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contact[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Message supprimé" });
    },
  });

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    if (!contact.is_read) {
      markReadMutation.mutate(contact.id);
    }
  };

  const unreadCount = contacts.filter((c) => !c.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Aucun message de contact pour l'instant.</p>
      </div>
    );
  }

  return (
    <>
      {unreadCount > 0 && (
        <div className="mb-4">
          <Badge variant="destructive">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</Badge>
        </div>
      )}

      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statut</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Modèle</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id} className={!contact.is_read ? "bg-primary/5" : ""}>
                <TableCell>
                  {contact.is_read ? (
                    <MailOpen className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Mail className="w-4 h-4 text-primary" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell className="max-w-[200px] truncate">{contact.subject}</TableCell>
                <TableCell>
                  {contact.template_title ? (
                    <Badge variant="secondary" className="text-xs">{contact.template_title}</Badge>
                  ) : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(contact.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleView(contact)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(contact.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedContact?.subject}</DialogTitle>
            <DialogDescription>
              De {selectedContact?.name} ({selectedContact?.email}) · {selectedContact?.created_at && new Date(selectedContact.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedContact?.template_title && (
            <div className="text-sm">
              <span className="text-muted-foreground">Modèle : </span>
              <Badge variant="secondary">{selectedContact.template_title}</Badge>
            </div>
          )}
          <div className="whitespace-pre-wrap text-sm text-foreground bg-muted/50 p-4 rounded-lg">
            {selectedContact?.message}
          </div>
          <Button variant="outline" asChild>
            <a href={`mailto:${selectedContact?.email}?subject=Re: ${selectedContact?.subject}`}>
              Répondre par e-mail
            </a>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
